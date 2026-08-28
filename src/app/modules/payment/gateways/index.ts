import { GatewayName, PaymentGateway } from '../payment.interface';
import { stripeGateway } from './stripe.gateway';
import { sslcommerzGateway } from './sslcommerz.gateway';

export const getGateway = (name: GatewayName): PaymentGateway =>
  name === 'STRIPE' ? stripeGateway : sslcommerzGateway;
