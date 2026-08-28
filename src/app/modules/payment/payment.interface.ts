export type GatewayName = 'STRIPE' | 'SSLCOMMERZ';

export interface InitiateInput {
  amount: number;
  bookingId: string;
  userEmail: string;
}

export interface GatewayInitiateResult {
  gatewayTransactionId: string;
  redirectUrl?: string;
  clientSecret?: string;
}

export interface WebhookResult {
  gatewayTransactionId: string;
  status: 'PAID' | 'FAILED';
  raw: unknown;
}

export interface RefundResult {
  refundId: string;
}

export interface PaymentGateway {
  name: GatewayName;
  initiate(input: InitiateInput): Promise<GatewayInitiateResult>;
  verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
