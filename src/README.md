# WalletConnect Integration for Stacks Payment Gateway

This directory contains the WalletConnect integration for the Stacks payment gateway application.

## Overview

WalletConnect enables seamless integration with Stacks wallets, allowing users to:
- Connect their Stacks wallets securely
- Transfer STX tokens
- Sign transactions and messages
- Call smart contract functions
- Process payments through the payment gateway

## Files

### `walletConnect.ts`
Core WalletConnect integration module with the following functions:

- **`initializeWalletConnect(projectId)`**: Initialize WalletConnect with your project ID
- **`getStacksAddresses(web3wallet)`**: Retrieve active Stacks addresses from connected wallet
- **`transferStx(web3wallet, transaction)`**: Transfer STX tokens to a recipient
- **`signTransaction(web3wallet, transaction, broadcast, network)`**: Sign Stacks transactions
- **`signMessage(web3wallet, messageRequest)`**: Sign messages with the wallet
- **`callContract(web3wallet, contract, functionName, functionArgs)`**: Call smart contract functions
- **`handleSessionProposal(web3wallet, proposalId, approve, supportedChains)`**: Handle wallet connection proposals

### `paymentGateway.ts`
Payment processing service built on top of WalletConnect:

- **`PaymentGateway` class**: Main service for processing payments
  - `processPayment()`: Direct STX transfer payment
  - `processPaymentViaContract()`: Payment through smart contract call
  - Built-in address and amount validation

### `index.ts`
High-level convenience functions and examples:

- `initializePaymentApp()`: Set up the entire payment system
- `connectWallet()`: Connect and retrieve user addresses
- `makePayment()`: Process a payment
- `handleIncomingProposal()`: Handle wallet connection requests

## Setup

### 1. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
VITE_MERCHANT_ADDRESS=SP1234567890...
VITE_CONTRACT_ADDRESS=SP1234567890....payment-gateway
VITE_NETWORK=testnet
```

### 3. Install Dependencies

```bash
npm install @reown/walletkit @walletconnect/utils @walletconnect/core
```

## Usage Examples

### Initialize the Payment App

```typescript
import { initializePaymentApp, connectWallet, makePayment } from './src/index';

// Initialize
const { web3wallet, paymentGateway } = await initializePaymentApp();

// Connect wallet
const addresses = await connectWallet(web3wallet);

// Process payment
const result = await makePayment(
  web3wallet,
  paymentGateway,
  '1000000000', // 1 STX in uSTX
  'SP1234567890...', // recipient
  addresses[0].address, // sender
  'Payment for order #123'
);

console.log('Transaction ID:', result.txid);
```

### Direct WalletConnect Usage

```typescript
import {
  initializeWalletConnect,
  transferStx,
  signMessage,
} from './src/walletConnect';

const { web3wallet } = await initializeWalletConnect(projectId);

// Transfer STX
const tx = await transferStx(web3wallet, {
  sender: 'SP...',
  recipient: 'SP...',
  amount: '1000000', // 1 STX in uSTX
  network: 'testnet',
});

// Sign a message
const sig = await signMessage(web3wallet, {
  address: 'SP...',
  message: 'Hello Stacks!',
  messageType: 'utf8',
  network: 'testnet',
});
```

## Supported Methods

### Core Methods
- `stx_getAddresses` - Get active Stacks addresses

### Transaction Methods
- `stx_transferStx` - Transfer STX tokens
- `stx_signTransaction` - Sign transactions
- `stx_signMessage` - Sign messages
- `stx_signStructuredMessage` - Sign structured data (SIP-018)
- `stx_callContract` - Call smart contract functions

## Network Support

- **mainnet**: Production network (addresses start with SP)
- **testnet**: Test network (addresses start with ST)
- **devnet**: Local development network

## Error Handling

All functions throw errors with descriptive messages. Always wrap calls in try-catch:

```typescript
try {
  const result = await makePayment(web3wallet, paymentGateway, ...);
} catch (error) {
  console.error('Payment failed:', error.message);
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Project ID**: Keep your WalletConnect Project ID confidential
3. **Address Validation**: The payment gateway validates all addresses before processing
4. **Amount Validation**: All amounts are validated to be positive numbers
5. **HTTPS Only**: Always use HTTPS in production

## Documentation

- [WalletConnect Stacks Documentation](https://docs.walletconnect.network/wallet-sdk/chain-support/stacks)
- [Stacks Developer Docs](https://docs.stacks.co/)

## Troubleshooting

### "No Stacks addresses found"
- Ensure wallet is properly connected
- Check that the wallet supports Stacks network

### "Invalid address format"
- Mainnet addresses must start with `SP`
- Testnet addresses must start with `ST`

### Connection timeout
- Check internet connection
- Verify WalletConnect Project ID
- Check wallet availability

## License

This integration is part of the Payment Gateway project.
