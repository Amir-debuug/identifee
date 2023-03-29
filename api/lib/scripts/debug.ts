/**
 * This script will allow you to test Biz/DAO layers
 */

import * as dotenv from 'dotenv';
import path from 'path';
// load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { defaultUsers } from '../middlewares/auth';
import { extendAs } from '../middlewares/context';
import { run, startSequelize } from './script';

(async () => {
  await run(async (context, span) => {
    try {
      await startSequelize(context);

      // TODO: change the user to the one you want to test with or leave as admin
      const req = await extendAs(defaultUsers.admin, context);

      // TODO: Add your debug code here
      /**
       * example:
       * 
       *
        const courses = await req.services.biz.course.get(
          undefined,
          { limit: 10, page: 1 },
          { order: [['totalLessons', 'desc']] }
        );
        console.log(courses);
       */
    } catch (error) {
      console.error(error);
    }
  });
})();
