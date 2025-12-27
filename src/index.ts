import {
  initializeWalletConnect,
  getStacksAddresses,
  handleSessionProposal,
} from './walletConnect';
import PaymentGateway from './paymentGateway';

/**
 * Example usage of WalletConnect integration with payment gateway
 */

// Configuration
const WALLET_CONNECT_PROJECT_ID = process.env.VITE_WALLET_CONNECT_PROJECT_ID || '';
const MERCHANT_ADDRESS = process.env.VITE_MERCHANT_ADDRESS || '';
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = (process.env.VITE_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet';

/**
 * Initialize the payment application
 */
export async function initializePaymentApp() {
  if (!WALLET_CONNECT_PROJECT_ID) {
    throw new Error('VITE_WALLET_CONNECT_PROJECT_ID environment variable is required');
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error('VITE_CONTRACT_ADDRESS environment variable is required');
  }

  // Initialize WalletConnect
  const { core, web3wallet } = await initializeWalletConnect(WALLET_CONNECT_PROJECT_ID);

  // Initialize Payment Gateway
  const paymentGateway = new PaymentGateway({
    merchantAddress: MERCHANT_ADDRESS,
    contractAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });

  return { core, web3wallet, paymentGateway };
}

/**
 * Connect wallet and get user addresses
 */
export async function connectWallet(web3wallet: any) {
  try {
    const addresses = await getStacksAddresses(web3wallet);

    if (addresses.length === 0) {
      throw new Error('No Stacks addresses found in connected wallet');
    }

    console.log('Connected addresses:', addresses);
    return addresses;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}

/**
 * Process a payment
 */
export async function makePayment(
  web3wallet: any,
  paymentGateway: any,
  amount: string,
  recipient: string,
  senderAddress: string,
  memo?: string
) {
  try {
    const result = await paymentGateway.processPayment(web3wallet, {
      amount,
      recipient,
      senderAddress,
      memo,
    });

    console.log('Payment successful:', result);
    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

/**
 * Handle incoming session proposals
 */
export async function handleIncomingProposal(
  web3wallet: any,
  proposalId: string,
  approve: boolean
) {
  try {
    await handleSessionProposal(web3wallet, proposalId, approve);
    console.log(`Proposal ${proposalId} ${approve ? 'approved' : 'rejected'}`);
  } catch (error) {
    console.error('Session proposal handling failed:', error);
    throw error;
  }
}

export default {
  initializePaymentApp,
  connectWallet,
  makePayment,
  handleIncomingProposal,
};
