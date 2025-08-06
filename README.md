# sBTC Payment Gateway

A comprehensive payment gateway smart contract built on the Stacks blockchain for businesses to accept sBTC payments with Bitcoin settlement.

## Overview

The sBTC Payment Gateway enables merchants to accept sBTC payments through a robust, feature-rich smart contract system. It provides merchant registration, payment processing, fee management, refunds, and administrative controls while ensuring secure Bitcoin-backed transactions.

## Features

### Core Functionality

- **Merchant Registration**: Businesses can register with custom fee rates and webhook configurations
- **Payment Processing**: Secure sBTC payment handling with automatic fee calculation
- **Refund System**: Merchants can refund completed payments to customers
- **Payment Expiration**: Automatic expiration of pending payments after configurable timeouts
- **Delegate Authorization**: Merchants can authorize staff members to manage payments

### Administrative Controls

- **Platform Fee Management**: Configurable platform-wide fee rates (max 10%)
- **Payment Limits**: Adjustable minimum payment amounts
- **Merchant Management**: Ability to activate/deactivate merchant accounts
- **Emergency Controls**: Contract owner emergency withdrawal capabilities

## Smart Contract Architecture

### Constants

```clarity
CONTRACT_OWNER           ; Contract deployer address
ERR_* constants         ; Error codes (u100-u109)
SBTC_TOKEN_CONTRACT     ; sBTC token contract reference
```

### Data Variables

- `payment-counter`: Unique payment ID incrementer
- `platform-fee-rate`: Global fee rate in basis points (default: 250 = 2.5%)
- `min-payment-amount`: Minimum payment threshold (default: 1000 microBTC)
- `payment-expiry-blocks`: Payment timeout in blocks (default: 144 ≈ 24 hours)

### Data Maps

- `merchants`: Merchant registration and statistics
- `payments`: Payment records and status tracking
- `payment-callbacks`: Webhook and callback data storage
- `merchant-authorizations`: Delegate authorization mapping

## Usage

### For Merchants

#### 1. Register as a Merchant

```clarity
(contract-call? .payment-gateway register-merchant
  "My Business Name"           ; business-name
  (some "https://webhook.url") ; webhook-url (optional)
  u300)                       ; custom-fee-rate (3% in basis points)
```

#### 2. Create Payment Request

```clarity
(contract-call? .payment-gateway create-payment-request
  u50000                       ; amount (500.00 microBTC)
  "Order #12345"              ; description
  (some "ORDER-12345")        ; external-id (optional)
  (some "https://callback")   ; callback-url (optional)
  (some "metadata"))          ; callback-data (optional)
```

#### 3. Check Payment Status

```clarity
(contract-call? .payment-gateway get-payment-status u1)
```

### For Customers

#### Process Payment

```clarity
(contract-call? .payment-gateway process-payment u1) ; payment-id
```

### For Merchant Delegates

#### Authorize Delegate

```clarity
(contract-call? .payment-gateway authorize-delegate 'SP1234...DELEGATE)
```

#### Process Refund (as authorized delegate)

```clarity
(contract-call? .payment-gateway refund-payment u1) ; payment-id
```

## API Reference

### Read-Only Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get-payment` | `payment-id: uint` | `(optional payment-data)` | Retrieve payment details |
| `get-merchant` | `merchant-address: principal` | `(optional merchant-data)` | Get merchant information |
| `get-payment-status` | `payment-id: uint` | `(response string-ascii)` | Get payment status |
| `calculate-fee` | `amount: uint, merchant: principal` | `(response uint)` | Calculate fee for amount |
| `is-payment-expired` | `payment-id: uint` | `(response bool)` | Check if payment expired |
| `get-platform-fee-rate` | - | `uint` | Get current platform fee rate |
| `get-min-payment-amount` | - | `uint` | Get minimum payment amount |

### Public Functions

#### Merchant Management

- `register-merchant`: Register new merchant account
- `update-merchant-settings`: Update merchant configuration
- `authorize-delegate`: Grant delegate permissions
- `revoke-delegate`: Remove delegate permissions

#### Payment Operations

- `create-payment-request`: Create new payment request
- `process-payment`: Complete payment (customer action)
- `refund-payment`: Refund completed payment (merchant action)
- `mark-expired-payment`: Mark pending payment as expired

#### Administrative Functions (Contract Owner Only)

- `set-platform-fee-rate`: Update platform fee rate
- `set-min-payment-amount`: Update minimum payment amount
- `set-payment-expiry-blocks`: Update payment expiration timeout
- `deactivate-merchant`: Deactivate merchant account
- `emergency-withdraw`: Emergency fund withdrawal

## Payment States

| State | Description |
|-------|-------------|
| `pending` | Payment created, awaiting customer payment |
| `completed` | Payment successfully processed |
| `refunded` | Payment was refunded to customer |
| `expired` | Payment expired before completion |

## Fee Structure

### Platform Fees

- Default platform fee: 2.5% (250 basis points)
- Maximum allowed fee: 10% (1000 basis points)
- Merchants can set custom fee rates up to the maximum

### Fee Calculation

```clarity
fee = (amount × fee-rate) ÷ 10000
net-amount = amount - fee
```

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| `u100` | `ERR_UNAUTHORIZED` | Caller not authorized for action |
| `u101` | `ERR_PAYMENT_NOT_FOUND` | Payment ID does not exist |
| `u102` | `ERR_PAYMENT_ALREADY_PROCESSED` | Payment already completed/refunded |
| `u103` | `ERR_INSUFFICIENT_AMOUNT` | Payment amount too low |
| `u104` | `ERR_INVALID_MERCHANT` | Merchant not active |
| `u105` | `ERR_PAYMENT_EXPIRED` | Payment past expiration time |
| `u106` | `ERR_INVALID_AMOUNT` | Invalid payment amount |
| `u107` | `ERR_MERCHANT_NOT_REGISTERED` | Merchant not registered |
| `u108` | `ERR_REFUND_FAILED` | Refund operation failed |
| `u109` | `ERR_INVALID_FEE_RATE` | Fee rate exceeds maximum |

## Security Features

### Access Controls

- Merchant-only functions protected by registration checks
- Delegate authorization system for merchant staff
- Contract owner administrative controls
- Payment state validation

### Safety Mechanisms

- Payment expiration to prevent stuck funds
- Fee rate limits to prevent excessive charges
- Amount validation for minimum thresholds
- Duplicate payment protection

## Development

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Stacks smart contract development tool
- Node.js (for testing framework)
- Stacks CLI (for deployment)

### Testing

```bash
# Run contract checks
clarinet check

# Run test suite
npm test
```

### Deployment

The contract references the sBTC token at:

```clarity
'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token
```

Update this constant for different networks before deployment.

## Network Configuration

### Devnet

- Configure in `settings/Devnet.toml`
- Use testnet sBTC contract address

### Testnet

- Configure in `settings/Testnet.toml`
- Use testnet sBTC contract address

### Mainnet

- Configure in `settings/Mainnet.toml`
- Use mainnet sBTC contract address

## Integration Examples

### JavaScript/TypeScript

```typescript
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode
} from '@stacks/transactions';

// Create payment request
const txOptions = {
  contractAddress: 'ST1234...CONTRACT',
  contractName: 'payment-gateway',
  functionName: 'create-payment-request',
  functionArgs: [
    uintCV(50000),                    // amount
    stringAsciiCV("Order #12345"),    // description
    someCV(stringAsciiCV("ORDER-1")), // external-id
    noneCV(),                         // callback-url
    noneCV()                          // callback-data
  ],
  senderKey: privateKey,
  network,
  anchorMode: AnchorMode.Any,
};

const transaction = await makeContractCall(txOptions);
const broadcastResponse = await broadcastTransaction(transaction, network);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## Changelog

### v1.0.0

- Initial release with core payment functionality
- Merchant registration and management
- Payment processing and refunds
- Administrative controls
- Delegate authorization system
