;; Payment Gateway
;; A comprehensive payment gateway for businesses to accept sBTC payments
;; Built for the Stacks blockchain with Bitcoin settlement

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_PAYMENT_NOT_FOUND (err u101))
(define-constant ERR_PAYMENT_ALREADY_PROCESSED (err u102))
(define-constant ERR_INSUFFICIENT_AMOUNT (err u103))
(define-constant ERR_INVALID_MERCHANT (err u104))
(define-constant ERR_PAYMENT_EXPIRED (err u105))
(define-constant ERR_INVALID_AMOUNT (err u106))
(define-constant ERR_MERCHANT_NOT_REGISTERED (err u107))
(define-constant ERR_REFUND_FAILED (err u108))
(define-constant ERR_INVALID_FEE_RATE (err u109))

;; sBTC token reference
(define-constant SBTC_TOKEN_CONTRACT 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token)

;; Data Variables
(define-data-var payment-counter uint u0)
(define-data-var platform-fee-rate uint u250) ;; 2.5% in basis points (250/10000)
(define-data-var min-payment-amount uint u1000) ;; Minimum payment in microBTC
(define-data-var payment-expiry-blocks uint u144) ;; ~24 hours at 10min/block

;; Data Maps
(define-map merchants
  principal
  {
    is-active: bool,
    business-name: (string-ascii 100),
    webhook-url: (optional (string-ascii 200)),
    fee-rate: uint, ;; custom fee rate for merchant (basis points)
    total-volume: uint,
    payment-count: uint,
    created-at: uint,
  }
)

(define-map payments
  uint
  {
    payment-id: uint,
    merchant: principal,
    customer: (optional principal),
    amount: uint,
    fee-amount: uint,
    status: (string-ascii 20), ;; "pending", "completed", "refunded", "expired"
    description: (string-ascii 200),
    external-id: (optional (string-ascii 100)), ;; merchant's order/invoice ID
    created-at: uint,
    expires-at: uint,
    completed-at: (optional uint),
    refunded-at: (optional uint),
  }
)

(define-map payment-callbacks
  uint
  {
    callback-url: (optional (string-ascii 200)),
    callback-data: (optional (string-ascii 500)),
  }
)

;; Authorization map for merchant staff/delegates
(define-map merchant-authorizations
  {
    merchant: principal,
    delegate: principal,
  }
  bool
)

;; Read-only functions

(define-read-only (get-payment (payment-id uint))
  (map-get? payments payment-id)
)

(define-read-only (get-merchant (merchant-address principal))
  (map-get? merchants merchant-address)
)

(define-read-only (get-payment-callback (payment-id uint))
  (map-get? payment-callbacks payment-id)
)

(define-read-only (get-platform-fee-rate)
  (var-get platform-fee-rate)
)

(define-read-only (get-min-payment-amount)
  (var-get min-payment-amount)
)

(define-read-only (get-payment-expiry-blocks)
  (var-get payment-expiry-blocks)
)

(define-read-only (calculate-fee
    (amount uint)
    (merchant principal)
  )
  (let (
      (merchant-info (unwrap! (map-get? merchants merchant) (err ERR_MERCHANT_NOT_REGISTERED)))
      (fee-rate (get fee-rate merchant-info))
      (effective-rate (if (> fee-rate u0)
        fee-rate
        (var-get platform-fee-rate)
      ))
    )
    (ok (/ (* amount effective-rate) u10000))
  )
)

(define-read-only (is-merchant-authorized
    (merchant principal)
    (delegate principal)
  )
  (or
    (is-eq merchant delegate)
    (default-to false
      (map-get? merchant-authorizations {
        merchant: merchant,
        delegate: delegate,
      })
    )
  )
)

(define-read-only (get-payment-status (payment-id uint))
  (match (map-get? payments payment-id)
    payment-data (ok (get status payment-data))
    (err ERR_PAYMENT_NOT_FOUND)
  )
)

(define-read-only (is-payment-expired (payment-id uint))
  (match (map-get? payments payment-id)
    payment-data (let ((expires-at (get expires-at payment-data)))
      (ok (>= stacks-block-height expires-at))
    )
    (err ERR_PAYMENT_NOT_FOUND)
  )
)

;; Private functions

(define-private (update-merchant-stats
    (merchant principal)
    (amount uint)
  )
  (match (map-get? merchants merchant)
    merchant-data (map-set merchants merchant
      (merge merchant-data {
        total-volume: (+ (get total-volume merchant-data) amount),
        payment-count: (+ (get payment-count merchant-data) u1),
      })
    )
    false
  )
)

;; Public functions

;; Register a new merchant
(define-public (register-merchant
    (business-name (string-ascii 100))
    (webhook-url (optional (string-ascii 200)))
    (custom-fee-rate uint)
  )
  (begin
    (asserts! (<= custom-fee-rate u1000) (err ERR_INVALID_FEE_RATE)) ;; Max 10% fee
    (ok (map-set merchants tx-sender {
      is-active: true,