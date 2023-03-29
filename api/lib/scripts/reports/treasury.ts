import * as dotenv from 'dotenv';
import path from 'path';

// load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { reportGeneratorBizFactory } from 'lib/biz/reportGeneratorBiz';
const { input } = require('./treasury.json');

async function run() {
  const instance = reportGeneratorBizFactory(input);
  if (!instance) {
    throw new Error('check your test json');
  }

  await instance.writeToLocalFiles();
  console.log('finished rendering...');
  process.exit(0);
}

run();
