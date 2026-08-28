import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PaymentService } from './payment.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';

const initiate = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initiate(
    req.body.bookingId,
    req.body.gateway,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment session initiated',
    data: result,
  });
});

const webhook = catchAsync(async (req: Request, res: Response) => {
  const gateway = req.params.gateway as 'STRIPE' | 'SSLCOMMERZ';
  const signature = req.headers['stripe-signature'] as string || (req.headers['x-ssl-signature'] as string) || '';
  const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
  await PaymentService.handleWebhook(gateway, raw, signature);
  res.status(200).json({ received: true });
});

const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const buffer = await PaymentService.getInvoice(req.params.bookingId, req.user!.userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.bookingId}.pdf"`);
  res.send(buffer);
});

const refund = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.refund(req.body.id, req.body.amount);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Refund processed',
    data: result,
  });
});

export const PaymentController = { initiate, webhook, getInvoice, refund };
