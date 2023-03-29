import * as dotenv from 'dotenv';
import path from 'path';
import { run, startSequelize } from './script';

// load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

(async () => {
  await run(async (context, span) => {
    await startSequelize(context);

    console.log('finished syncing...');
  });
})();
