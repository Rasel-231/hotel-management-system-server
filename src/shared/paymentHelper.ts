import { SslCommerzPayment } from 'sslcommerz';
import config from '../config';

const initPayment = async (paymentData: {
  total_amount: number;
  tran_id: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
}) => {
  const sslcz = new SslCommerzPayment(
    config.sslcommerz.store_id!,
    config.sslcommerz.store_password!,
    config.sslcommerz.is_live
  );

  const requestPayload = {
    ...paymentData,
    currency: 'BDT',
    success_url: `${config.base_url}/payments/success?tran_id=${paymentData.tran_id}`,
    fail_url: `${config.base_url}/payments/fail?tran_id=${paymentData.tran_id}`,
    cancel_url: `${config.base_url}/payments/cancel`,
    shipping_method: 'NO',
    product_name: 'System Checkout Processing',
    product_category: 'E-commerce Asset',
    product_profile: 'general',
  };

  const response = await sslcz.init(requestPayload);
  return response.GatewayPageURL;
};

export const paymentHelper = {
  initPayment,
};
