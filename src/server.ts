import { Server } from 'http';
import app from './app';
import config from './config';
import { RedisService } from './shared/redis';

async function myserver() {
  let server: Server;
  try {
    await RedisService.connectRedis();

    server = app.listen(config.port, () => {
      console.log(` Fully secure operational grid safe on port channels: ${config.port}`);
    });
  } catch (err) {
    console.error('System structural entry deployment setup pipeline aborted:', err);
  }
}

myserver();
