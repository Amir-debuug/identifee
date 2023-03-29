// api/lib/middlewares/context/middleware.ts
// object instantiate

import { Project } from 'ts-morph';
import {
  writeContextServiceType,
  writeNamedImport,
  writeToIndex,
} from './setup';

const project = new Project({
  tsConfigFilePath: `${__dirname}/../../../tsconfig.json`,
});

const className = 'Test';
const fileName = 'testBiz.ts';

const bizDirectory = `lib/biz`;

const classPath = `${bizDirectory}/${fileName}`;

(async () => {
  const bizClassName = `${className}Biz`;

  // create class
  const classExists = !!project.getSourceFile(classPath);
  if (!classExists) {
    const bizClassFile = project.createSourceFile(classPath, (writer) => {
      writer.writeLine("import { Biz } from './utils';");
      writer.writeLine('');
      writer.writeLine(`export class ${bizClassName} extends Biz {}`);
    });
    bizClassFile.saveSync();
  }

  writeToIndex(project, bizDirectory, fileName);

  // write to context/types
  writeNamedImport(
    project,
    'lib/middlewares/context/types.ts',
    'lib/biz',
    bizClassName
  );

  writeContextServiceType(
    project,
    'lib/middlewares/context/types.ts',
    'biz',
    bizClassName
  );
})();
