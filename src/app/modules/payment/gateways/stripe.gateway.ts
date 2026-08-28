import Stripe from 'stripe';
import config from '../../../../config';
import {
  GatewayInitiateResult,
  InitiateInput,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from '../payment.interface';

let stripeClient: Stripe | null = null;
const getStripe = (): Stripe => {
  if (!stripeClient) stripeClient = new Stripe(config.stripe.secret_key);
  return stripeClient;
};

export const stripeGateway: PaymentGateway = {
  name: 'STRIPE',
  async initiate(input: InitiateInput): Promise<GatewayInitiateResult> {
    const intent = await getStripe().paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: 'usd',
      receipt_email: input.userEmail,
      metadata: { bookingId: input.bookingId },
    });
    return {
      gatewayTransactionId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
    };
  },
  async verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult> {
    const event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhook_secret
    );
    const intent = event.data.object as Stripe.PaymentIntent;
    return {
      gatewayTransactionId: intent.id,
      status: intent.status === 'succeeded' ? 'PAID' : 'FAILED',
      raw: event,
    };
  },
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await getStripe().refunds.create({
      payment_intent: transactionId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return { refundId: refund.id };
  },
};
