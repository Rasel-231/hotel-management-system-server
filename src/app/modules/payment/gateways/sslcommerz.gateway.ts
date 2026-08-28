import config from '../../../../config';
import {
  GatewayInitiateResult,
  InitiateInput,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from '../payment.interface';

const baseUrl = config.sslcommerz.is_live
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com';

export const sslcommerzGateway: PaymentGateway = {
  name: 'SSLCOMMERZ',
  async initiate(input: InitiateInput): Promise<GatewayInitiateResult> {
    const res = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: config.sslcommerz.store_id,
        store_passwd: config.sslcommerz.store_password,
        total_amount: input.amount,
        currency: 'BDT',
        tran_id: input.bookingId,
        cus_email: input.userEmail,
        success_url: `${config.base_url}/payments/webhook/sslcommerz`,
        fail_url: `${config.base_url}/payments/webhook/sslcommerz`,
        cancel_url: `${config.base_url}/payments/webhook/sslcommerz`,
      }),
    });
    const data = (await res.json()) as { tran_id: string; GatewayPageURL?: string };
    return {
      gatewayTransactionId: data.tran_id,
      redirectUrl: data.GatewayPageURL,
    };
  },
  async verifyWebhook(rawBody: Buffer): Promise<WebhookResult> {
    const data = JSON.parse(rawBody.toString()) as { tran_id: string; status: string };
    const paid = data.status === 'VALID' || data.status === 'VALIDATED';
    return {
      gatewayTransactionId: data.tran_id,
      status: paid ? 'PAID' : 'FAILED',
      raw: data,
    };
  },
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const res = await fetch(`${baseUrl}/validator/api/merchant/transaction/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: config.sslcommerz.store_id,
        store_passwd: config.sslcommerz.store_password,
        bank_tran_id: transactionId,
        refund_amount: amount,
      }),
    });
    const data = (await res.json()) as { refund_ref_id?: string };
    return { refundId: data.refund_ref_id ?? transactionId };
  },
};
