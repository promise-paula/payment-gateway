import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@reown/walletkit';

// Types for Stacks integration
interface StacksAddress {
  symbol: string;
  address: string;
}

interface TransactionRequest {
  sender: string;
  recipient: string;
  amount: string;
  memo?: string;
  network: 'mainnet' | 'testnet' | 'devnet';
}

interface SignMessageRequest {
  address: string;
  message: string;
  messageType: 'utf8' | 'structured';
  network: 'mainnet' | 'testnet' | 'devnet';
  domain?: string;
}

/**
 * Initialize WalletConnect Core for Stacks
 */
export async function initializeWalletConnect(projectId: string) {
  const core = new Core({
    projectId,
  });

  const web3wallet = await Web3Wallet.create({
    core,
  });

  return { core, web3wallet };
}

/**
 * Get active Stacks addresses from the connected wallet
 */
export async function getStacksAddresses(
  web3wallet: any
): Promise<StacksAddress[]> {
  try {
    const response = await web3wallet.request({
      topic: '',
      request: {
        method: 'stx_getAddresses',
        params: {},
      },
    });

    if (response.result && response.result.addresses) {
      return response.result.addresses;
    }

    return [];
  } catch (error) {
    console.error('Error getting Stacks addresses:', error);
    throw error;
  }
}

/**
 * Transfer STX tokens
 */
export async function transferStx(
  web3wallet: any,
  transaction: TransactionRequest
): Promise<{ txid: string; transaction: string }> {
  try {
    const response = await web3wallet.request({
      topic: '',
      request: {
        method: 'stx_transferStx',
        params: transaction,
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error transferring STX:', error);
    throw error;
  }
}

/**
 * Sign a Stacks transaction
 */
export async function signTransaction(
  web3wallet: any,
  transaction: string,
  broadcast: boolean = false,
  network: string = 'mainnet'
): Promise<{ signature: string; transaction: string; txid?: string }> {
  try {
    const response = await web3wallet.request({
      topic: '',
      request: {
        method: 'stx_signTransaction',
        params: {
          transaction,
          broadcast,
          network,
        },
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}

/**
 * Sign a message
 */
export async function signMessage(
  web3wallet: any,
  messageRequest: SignMessageRequest
): Promise<{ signature: string }> {
  try {
    const response = await web3wallet.request({
      topic: '',
      request: {
        method: 'stx_signMessage',
        params: messageRequest,
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}

/**
 * Call a Stacks smart contract
 */
export async function callContract(
  web3wallet: any,
  contract: string,
  functionName: string,
  functionArgs: string[] = []
): Promise<{ txid: string; transaction: string }> {
  try {
    const response = await web3wallet.request({
      topic: '',
      request: {
        method: 'stx_callContract',
        params: {
          contract,
          functionName,
          functionArgs,
        },
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error calling contract:', error);
    throw error;
  }
}

/**
 * Handle session proposals and approve/reject connections
 */
export async function handleSessionProposal(
  web3wallet: any,
  proposalId: string,
  approve: boolean,
  supportedChains: string[] = ['stacks:1', 'stacks:2147483647']
) {
  try {
    if (approve) {
      await web3wallet.approveSession({
        id: proposalId,
        namespaces: {
          stacks: {
            chains: supportedChains,
            methods: [
              'stx_getAddresses',
              'stx_transferStx',
              'stx_signTransaction',
              'stx_signMessage',
              'stx_callContract',
            ],
            events: ['accountsChanged', 'networkChanged'],
          },
        },
      });
    } else {
      await web3wallet.rejectSession({
        id: proposalId,
        reason: 'User rejected the session',
      });
    }
  } catch (error) {
    console.error('Error handling session proposal:', error);
    throw error;
  }
}

export default {
  initializeWalletConnect,
  getStacksAddresses,
  transferStx,
  signTransaction,
  signMessage,
  callContract,
  handleSessionProposal,
};
