# sBTC Payment Gateway

A comprehensive, production-ready payment gateway built on the Stacks blockchain for businesses to accept sBTC payments with Bitcoin settlement. Integrated with WalletConnect for seamless wallet connectivity.

## 🚀 Overview

The sBTC Payment Gateway is a full-stack solution enabling merchants to accept sBTC payments through a robust smart contract system combined with modern wallet integration. It provides:

- **Secure Payment Processing**: sBTC transfers with automatic fee calculation
- **Merchant Dashboard**: Manage payments, refunds, and business settings
- **Wallet Integration**: WalletConnect support for multiple Stacks wallets
- **Smart Contract Backend**: Clarity-based contract for on-chain operations
- **Fee Management**: Configurable rates for merchants and platform
- **Refund System**: Full refund capabilities with audit trails
- **Administrative Controls**: Owner controls for system management

## ✨ Features

### Core Payment Functionality

- ✅ **Merchant Registration**: Easy onboarding with customizable fee rates
- ✅ **Payment Processing**: Secure sBTC transfers with instant settlement
- ✅ **Refund System**: Complete refund capabilities with tracking
- ✅ **Payment Expiration**: Automatic cleanup of expired payments (24-hour default)
- ✅ **Delegate Authorization**: Merchants can authorize staff to manage payments
- ✅ **Payment Callbacks**: Webhook support for real-time payment notifications

### WalletConnect Integration

- 🔌 **Multi-Wallet Support**: Connect any Stacks-compatible wallet
- 🔐 **Secure Signing**: Message and transaction signing through WalletConnect
- 💳 **Direct Transfers**: STX token transfers via connected wallets
- 📝 **Contract Calls**: Call smart contract functions directly from the app
- 🔄 **Session Management**: Persistent wallet connections with session handling

### Administrative Features

- 🎛️ **Fee Rate Management**: Adjust platform fees (max 10%)
- 📊 **Payment Monitoring**: View all transactions and merchant statistics
- 💰 **Minimum Payment Limits**: Set minimum transaction thresholds
- ⚠️ **Emergency Controls**: Contract owner emergency withdrawal capabilities
- 👤 **Merchant Management**: Activate/deactivate accounts, view details

## 📋 Project Structure

```
payment-gateway/
├── contracts/
│   └── payment-gateway.clar      # Main Clarity smart contract
├── src/
│   ├── walletConnect.ts           # WalletConnect core integration
│   ├── paymentGateway.ts          # Payment processing service
│   ├── index.ts                   # Application entry point
│   ├── .env.example               # Environment configuration template
│   └── README.md                  # Detailed integration guide
├── tests/
│   └── payment-gateway.test.ts    # Test suite
├── settings/
│   ├── Devnet.toml               # Development network config
│   ├── Testnet.toml              # Test network config
│   └── Mainnet.toml              # Production network config
├── Clarinet.toml                  # Project configuration
├── package.json                   # NPM dependencies
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.js              # Test configuration
└── README.md                      # This file
```

## 🏗️ Smart Contract Architecture

### Constants

```clarity
CONTRACT_OWNER           ; Contract deployer address
ERR_UNAUTHORIZED         ; Permission denied (u100)
ERR_PAYMENT_NOT_FOUND    ; Invalid payment ID (u101)
ERR_PAYMENT_ALREADY_PROCESSED ; Duplicate payment (u102)
ERR_INSUFFICIENT_AMOUNT  ; Amount too small (u103)
ERR_INVALID_MERCHANT     ; Merchant not registered (u104)
ERR_PAYMENT_EXPIRED      ; Payment timeout exceeded (u105)
ERR_INVALID_AMOUNT       ; Invalid amount value (u106)
ERR_MERCHANT_NOT_REGISTERED ; Not a merchant (u107)
ERR_REFUND_FAILED        ; Refund operation failed (u108)
ERR_INVALID_FEE_RATE     ; Invalid fee rate (u109)
SBTC_TOKEN_CONTRACT      ; sBTC token contract reference
```

### Data Storage

**Variables**
- `payment-counter`: Unique ID incrementer for payments
- `platform-fee-rate`: Global fee in basis points (250 = 2.5%)
- `min-payment-amount`: Minimum payment threshold
- `payment-expiry-blocks`: Payment timeout duration

**Maps**
- `merchants`: Merchant data (fees, webhooks, stats)
- `payments`: Payment records and status
- `payment-callbacks`: Webhook configurations
- `merchant-authorizations`: Delegate permissions


## 🔧 Installation & Setup

### Prerequisites

- **Node.js**: v16+ (for TypeScript/JavaScript integration)
- **Clarinet**: Latest version (for smart contract development)
- **npm**: v7+ (for package management)
- **Git**: For version control

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd payment-gateway
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `@reown/walletkit` - WalletConnect Wallet SDK
- `@walletconnect/core` - WalletConnect core library
- `@walletconnect/utils` - Utility functions
- `vitest` - Testing framework
- `typescript` - TypeScript support

### Step 3: Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp src/.env.example .env
```

Edit `.env` with your configuration:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# Merchant Configuration
VITE_MERCHANT_ADDRESS=SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ

# Smart Contract Address
VITE_CONTRACT_ADDRESS=SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ.payment-gateway

# Network: mainnet, testnet, or devnet
VITE_NETWORK=testnet
```

### Step 4: Verify Smart Contract

```bash
clarinet check
```

This validates the Clarity smart contract for syntax and logic errors.

## 📱 WalletConnect Integration

### Getting Started

1. **Create WalletConnect Project**:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Sign up and create a new project
   - Copy your Project ID
   - Add it to your `.env` file

2. **Initialize Application**:

```typescript
import { initializePaymentApp, connectWallet, makePayment } from './src/index';

// Setup the payment gateway
const { web3wallet, paymentGateway } = await initializePaymentApp();

// Connect user wallet
const addresses = await connectWallet(web3wallet);

// Process a payment
const result = await makePayment(
  web3wallet,
  paymentGateway,
  '1000000000', // 1 STX in microSTX
  'SP123...', // recipient
  addresses[0].address, // sender
  'Payment for order #123'
);

console.log('Transaction ID:', result.txid);
```

### Supported Wallet Methods

| Method | Purpose |
|--------|---------|
| `stx_getAddresses` | Retrieve user's Stacks addresses |
| `stx_transferStx` | Transfer STX tokens |
| `stx_signTransaction` | Sign Stacks transactions |
| `stx_signMessage` | Sign messages for authentication |
| `stx_callContract` | Call smart contract functions |

For detailed integration guide, see [src/README.md](src/README.md)

## 💻 Usage

### For Merchants

#### 1. Register Your Business

```typescript
import { initializePaymentApp } from './src/index';

const { web3wallet, paymentGateway } = await initializePaymentApp();

// Register merchant with custom fee rate
const registration = await web3wallet.request({
  method: 'stx_callContract',
  params: {
    contract: 'SP1234...payment-gateway',
    functionName: 'register-merchant',
    functionArgs: [
      'My Business Name',
      'https://webhook.example.com/payments',
      '300' // 3% fee rate in basis points
    ]
  }
});
```

#### 2. Create Payment Request

```typescript
const paymentRequest = await web3wallet.request({
  method: 'stx_callContract',
  params: {
    contract: 'SP1234...payment-gateway',
    functionName: 'create-payment-request',
    functionArgs: [
      '50000', // 500 microSTX
      'Order #12345',
      'ORDER-12345'
    ]
  }
});
```

#### 3. Process Refund

```typescript
const refund = await web3wallet.request({
  method: 'stx_callContract',
  params: {
    contract: 'SP1234...payment-gateway',
    functionName: 'refund-payment',
    functionArgs: ['1'] // payment-id
  }
});
```

### For Customers

#### Make a Payment

```typescript
import { initializePaymentApp, makePayment } from './src/index';

const { web3wallet, paymentGateway } = await initializePaymentApp();
const addresses = await connectWallet(web3wallet);

const receipt = await makePayment(
  web3wallet,
  paymentGateway,
  '100000000', // Amount in microSTX
  'SPrecipient...', // Merchant address
  addresses[0].address, // Your address
  'Payment memo'
);

console.log('Payment successful! TX:', receipt.txid);
```

## 🧪 Testing

### Run Test Suite

```bash
npm test
```

Or using the Clarinet task:

```bash
clarinet test
```

### Check Smart Contract

```bash
clarinet check
```

### Generate Deployment Plan

```bash
# For testnet
clarinet deployment generate --testnet --low-cost

# For mainnet
clarinet deployment generate --mainnet --low-cost
```

## 🚀 Deployment

### Testnet Deployment

1. **Configure Testnet Settings**:

```toml
# settings/Testnet.toml
[network]
name = "testnet"
deployment-height = 0
```

2. **Deploy Contract**:

```bash
clarinet deployment apply --testnet
```

### Mainnet Deployment

⚠️ **Production Ready Checklist**:
- [ ] Thorough security audit completed
- [ ] All tests passing
- [ ] Environment variables secured
- [ ] Fee rates reviewed
- [ ] Merchant limits configured
- [ ] Incident response plan prepared

```bash
clarinet deployment apply --mainnet
```

## 📚 API Reference

### WalletConnect Methods

For comprehensive documentation on all supported methods, parameters, and response formats, see:
- [WalletConnect Stacks Docs](https://docs.walletconnect.network/wallet-sdk/chain-support/stacks)
- [src/walletConnect.ts](src/walletConnect.ts) - Implementation details

### Smart Contract Functions

#### Public Functions

- `register-merchant(business-name, webhook-url, fee-rate)` - Register as merchant
- `create-payment-request(amount, description, external-id)` - Create payment
- `process-payment(payment-id)` - Pay for a request
- `refund-payment(payment-id)` - Refund a payment
- `authorize-delegate(delegate-address)` - Authorize staff member

#### Read-Only Functions

- `get-payment-status(payment-id)` - Check payment state
- `get-merchant-info(merchant-address)` - Get merchant details
- `get-platform-fee-rate()` - Get current platform fee

## 🔒 Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` files with credentials
   - Use strong, unique Project IDs
   - Rotate keys regularly

2. **Address Validation**
   - Mainnet: addresses start with `SP`
   - Testnet: addresses start with `ST`
   - The system validates all addresses automatically

3. **Amount Handling**
   - All amounts in microSTX (1 STX = 1,000,000 microSTX)
   - Amounts must be positive integers
   - Automatic overflow protection

4. **HTTPS Only**
   - Always use HTTPS in production
   - Webhook endpoints must use HTTPS

### Audit & Compliance

- Regular security audits recommended
- Compliance with local financial regulations required
- Audit trails available for all transactions

## 🐛 Troubleshooting

### Common Issues

#### "No Stacks addresses found"

```typescript
// Ensure wallet is properly connected
const addresses = await connectWallet(web3wallet);
if (addresses.length === 0) {
  console.error('Wallet not connected or no addresses available');
}
```

#### "Invalid address format"

```typescript
// Verify address format
const isValid = /^(SP|ST)[A-Z0-9]{32}$/.test(address);
if (!isValid) {
  throw new Error('Invalid Stacks address format');
}
```

#### "Insufficient balance"

```typescript
// Check balance before sending
// Note: This requires integration with a balance API
// See Stacks API documentation
```

#### Contract Check Fails

```bash
# Run detailed check
clarinet check --verbose

# Check specific contract
clarinet check contracts/payment-gateway.clar
```

## 📞 Support & Resources

- **Documentation**: [Stacks Developer Docs](https://docs.stacks.co/)
- **WalletConnect**: [WalletConnect Docs](https://docs.walletconnect.network/)
- **Clarity Reference**: [Clarity Language Guide](https://docs.stacks.co/clarity)
- **Discord**: [Stacks Community](https://discord.gg/stacks)

## 📄 License

This project is part of the Promise2 initiative.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with detailed description
4. Ensure all tests pass

## 📝 Changelog

### Version 1.0.0 - Initial Release

- ✅ Smart contract payment processing
- ✅ WalletConnect integration
- ✅ Merchant registration system
- ✅ Refund capabilities
- ✅ Comprehensive test suite
- ✅ Full documentation

---

**Built with ❤️ for the Stacks Ecosystem**

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
'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
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

## WalletConnect Integration

This application integrates WalletConnect for Stacks support. Follow the instructions below to set it up.

### Installation

Run the following command to install the necessary dependencies:

```bash
npm install @reown/walletkit @walletconnect/utils @walletconnect/core
```

### Usage

Refer to the [WalletConnect documentation](https://docs.walletconnect.network/wallet-sdk/chain-support/stacks#stacks) for detailed usage instructions.

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
