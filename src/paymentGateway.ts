import {
  transferStx,
  callContract,
  signTransaction,
  TransactionRequest,
  StacksAddress,
} from './walletConnect';

interface PaymentConfig {
  merchantAddress: string;
  contractAddress: string;
  network: 'mainnet' | 'testnet' | 'devnet';
}

interface PaymentRequest {
  amount: string; // in uSTX
  recipient: string;
  memo?: string;
  senderAddress: string;
}

/**
 * Payment Gateway Service for Stacks with WalletConnect
 */
export class PaymentGateway {
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  /**
   * Process a STX payment through WalletConnect
   */
  async processPayment(
    web3wallet: any,
    payment: PaymentRequest
  ): Promise<{ txid: string; transaction: string }> {
    try {
      // Validate payment
      if (!this.isValidAmount(payment.amount)) {
        throw new Error('Invalid payment amount');
      }

      if (!this.isValidAddress(payment.recipient)) {
        throw new Error('Invalid recipient address');
      }

      // Create transaction request
      const txRequest: TransactionRequest = {
        sender: payment.senderAddress,
        recipient: payment.recipient,
        amount: payment.amount,
        memo: payment.memo || `Payment processed via ${this.config.contractAddress}`,
        network: this.config.network,
      };

      // Execute the transfer
      const result = await transferStx(web3wallet, txRequest);

      console.log(`Payment processed. Transaction ID: ${result.txid}`);
      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  /**
   * Process payment using smart contract call
   */
  async processPaymentViaContract(
    web3wallet: any,
    payment: PaymentRequest,
    functionName: string = 'process-payment'
  ): Promise<{ txid: string; transaction: string }> {
    try {
      // Encode function arguments
      const functionArgs = this.encodePaymentArgs(payment);

      // Call the contract function
      const result = await callContract(
        web3wallet,
        this.config.contractAddress,
        functionName,
        functionArgs
      );

      console.log(`Contract payment processed. Transaction ID: ${result.txid}`);
      return result;
    } catch (error) {
      console.error('Contract-based payment failed:', error);
      throw error;
    }
  }

  /**
   * Validate STX address format
   */
  private isValidAddress(address: string): boolean {
    // Mainnet addresses start with SP, testnet with ST
    const mainnetPattern = /^SP[A-Z0-9]{32}$/;
    const testnetPattern = /^ST[A-Z0-9]{32}$/;

    return mainnetPattern.test(address) || testnetPattern.test(address);
  }

  /**
   * Validate payment amount (must be positive number)
   */
  private isValidAmount(amount: string): boolean {
    const num = BigInt(amount);
    return num > 0n;
  }

  /**
   * Encode payment arguments for contract call
   */
  private encodePaymentArgs(payment: PaymentRequest): string[] {
    return [
      payment.amount,
      payment.recipient,
      payment.memo || '',
    ];
  }

  /**
   * Get payment gateway status
   */
  getConfig(): PaymentConfig {
    return this.config;
  }
}

export default PaymentGateway;
