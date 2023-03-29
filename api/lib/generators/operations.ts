import express from 'express';
import * as fs from 'fs';
import openapi from 'openapi-typescript';
import { appendDefaultsToDocs } from '../middlewares/openapi/helpers';
import { openAPIMiddleware } from '../middlewares/openapi/middleware';

const pkg = require('../../package.json');
const outputPath = 'lib/generators/operations.gen.ts';

(async () => {
  const res = openAPIMiddleware(express(), '/api', pkg, {
    enableGlob: true,
    exposeAPIDocs: true,
  });
  (res.apiDoc as any) = appendDefaultsToDocs(res.apiDoc);

  let types = await openapi(res.apiDoc);

  // SUPER hacky.... need to investigate a better way..
  types = types.replace(
    '| string',
    '| `last ${number} ${components["schemas"]["AnalyticGranularity"]}`'
  );
  types = types.replace(
    '| string;',
    '| `from ${number} ${components["schemas"]["AnalyticGranularity"]} ago to now`'
  );
  types = types.replace(': unknown | null', ': null');

  /**
   * Response unknown fixing..
   */
  types = types.replace('| unknown[]', '| []');
  types = types.replace(
    /"application\/json": { \[key: string\]: unknown };\n/g,
    '"application/json": {};\n'
  );

  /**
   * Date fixing...
   */
  types = types.replace(/([^\w])Date\: string;/g, 'Date: Date;');
  types = types.replace(
    /last_access\?\:.*\n/g,
    'deletedAt?: components["schemas"]["Date"] | null;\n'
  );
  types = types.replace(
    /deletedAt\?\:.*\n/g,
    'deletedAt?: components["schemas"]["Date"] | null;\n'
  );
  types = types.replace(
    /deleted_on\?\:.*\n/g,
    'deleted_on?: components["schemas"]["Date"] | null;\n'
  );
  types = types.replace(
    /completed_at\?\:.*\n/g,
    'completed_at?: components["schemas"]["Date"] | null;\n'
  );
  types = types.replace(
    /completedAt\?\:.*\n/g,
    'completedAt?: components["schemas"]["Date"] | null;\n'
  );

  /**
   * The following is for tuples..
   */

  /**
   * AnalyticDateRange fixing...
   */
  types = types.replace(
    /AnalyticDateRange:\n\s+\| components\["schemas"\]\["AnalyticRelativeTimeRange"\]\n\s+\| string\[\];/g,
    'AnalyticDateRange:\n  | components["schemas"]["AnalyticRelativeTimeRange"]\n  | [string,string];'
  );

  /**
   * AnalyticCompareDateRange fixing...
   */
  types = types.replace(
    /AnalyticCompareDateRange:\n\s+\| components\["schemas"\]\["AnalyticDateRange"\]\[\]\n\s+\| components\["schemas"\]\["AnalyticDateRange"\]\[\];/g,
    `
    AnalyticCompareDateRange:
      | [components["schemas"]["AnalyticDateRange"]]
      | [components["schemas"]["AnalyticDateRange"],components["schemas"]["AnalyticDateRange"]];
    `
  );

  /**
   * AnalyticTimeDimension fixing...
   */
  types = types.replace(
    /AnalyticTimeDimension:\s+\|\sstring\[\]/g,
    `AnalyticTimeDimension:
      | []`
  );
  types = types.replace(/timeDimensions:[^ ]/g, 'timeDimensions: []\n');
  types = types.replace(
    /\| {\n\s+dateRange: components\["schemas"\]\["AnalyticDateRange"\];\n\s+\/\*\* AnalyticTimeDimension\.0\.dimension \*\/\n\s+dimension: string;\n\s+granularity\?: components\["schemas"\]\["AnalyticGranularity"\];\n\s+}\[\]/g,
    `| [{
        dateRange: components["schemas"]["AnalyticDateRange"];
        /** AnalyticTimeDimension.[].dimension */
        dimension: string;
        granularity?: components["schemas"]["AnalyticGranularity"];
     }]`
  );
  types = types.replace(
    /\| {\n\s+compareDateRange: components\["schemas"\]\["AnalyticCompareDateRange"\];\n\s+\/\*\* AnalyticTimeDimension\.0\.dimension \*\/\n\s+dimension: string;\n\s+granularity\?: components\["schemas"\]\["AnalyticGranularity"\];\n\s+}\[\]/g,
    `| [{
        compareDateRange: components["schemas"]["AnalyticCompareDateRange"];
        /** AnalyticTimeDimension.[].dimension */
        dimension: string;
        granularity?: components["schemas"]["AnalyticGranularity"];
     }]`
  );

  types = types.replace(
    '[key: string]: Partial<string> & Partial<number> & Partial<boolean>;',
    '[key: string]: string | number | boolean;'
  );
  // partial is a result of anyOf which is incorrect
  types = types.replace(/Partial<([^>]*)> &/g, '$1 |');
  types = types.replace(/Partial<([^>]*)>;/g, '$1');

  const schemaPath = outputPath;
  fs.writeFileSync(schemaPath, types);
})();
