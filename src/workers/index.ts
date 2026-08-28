import './email.worker';
import './pdf.worker';
import './refund.worker';

export const startWorkers = (): void => {
  // Workers self-register on import; nothing else needed.
};
