// retrieved and modified from: https://replit.com/@OlegZaimkin/KhakiBrokenPagerecognition#index.ts
// also consider using ts-morph if this gets too complex

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import ts from 'typescript';

const rootPath = './lib';
const bizDirectory = path.resolve(rootPath, 'biz');
const daoDirectory = path.resolve(rootPath, 'dao');
const dbDirectory = path.resolve(rootPath, 'middlewares/sequelize/models');
const resultFileName = 'lib/generators/expandedTypes.gen.ts';

// lol callback...
glob.default(`${dbDirectory}/**/*.ts`, (err, files) => {
  glob.default(`${bizDirectory}/**/*Biz.ts`, (err, bizFiles) => {
    glob.default(`${daoDirectory}/**/*DAO.ts`, (err, daoFiles) => {
      const allFiles = [
        ...files,
        ...bizFiles,
        ...daoFiles,
        path.resolve(rootPath, 'middlewares/sequelize/types.ts'),
        path.resolve(rootPath, 'utils/types.ts'),
        path.resolve(rootPath, 'dao/utils/types.ts'),
        path.resolve(rootPath, 'biz/reportGeneratorBiz/utils/types.ts'),

        // yikes...
        path.resolve(
          rootPath,
          '../node_modules/@mux/mux-node/dist/video/domain.d.ts'
        ),
      ];
      run(allFiles);
    });
  });
});

async function run(fileNames: string[]) {
  const program = ts.createProgram([...fileNames], {
    rootDir: rootPath,
    sourceRoot: rootPath,
    strictNullChecks: true, // without this, `null` is not included in union types when undefined is set
    paths: {
      'lib/*': ['lib/*'],
    },
  });

  const typeChecker = program.getTypeChecker();
  const writeStream = fs.createWriteStream(resultFileName);

  fileNames.forEach((fileName) => {
    const sourceFile = program.getSourceFile(fileName);

    if (!sourceFile) {
      return;
    }

    // processing types
    ts.forEachChild(sourceFile, (child) => {
      if (!ts.isTypeAliasDeclaration(child)) {
        return;
      }

      const typeDecl = child as ts.TypeAliasDeclaration;
      const typeName = typeDecl.name.getText(sourceFile);

      if (typeDecl.typeParameters) {
        return;
      }

      // these types are only required for Biz types as they're the front facing API
      if (
        typeName.includes('DAO') ||
        typeName === 'DaoOpts' ||
        typeName === 'InsightRpmgOpt' ||
        typeName === 'InsightSpOpt' ||
        typeName.includes('GetSelfContext')
      ) {
        return;
      }

      processTypeDeclaration(typeDecl, typeName, false);
    });

    ts.forEachChild(sourceFile, (child) => {
      if (!ts.isInterfaceDeclaration(child)) {
        return;
      }

      const interfaceDecl = child as ts.InterfaceDeclaration;
      const interfaceName = interfaceDecl.name.getText(sourceFile);

      if (interfaceDecl.typeParameters) {
        return;
      }

      const rawIncludeFiles = ['domain.d.ts'];
      processTypeDeclaration(
        interfaceDecl,
        interfaceName,
        rawIncludeFiles.some((file) => sourceFile.fileName.includes(file))
      );
    });

    // processing Biz class method return types
    ts.forEachChild(sourceFile, (child) => {
      if (!ts.isClassDeclaration(child) || !child.name) {
        return;
      }
      const className = child.name.escapedText as string;

      // return types gets complex for these classes
      if (
        !className.endsWith('Biz') ||
        ['FeedResourceBiz', 'DealFeedBiz', 'InsightBiz'].includes(className)
      ) {
        return;
      }

      const classDecl = child as ts.ClassDeclaration;
      const classType = typeChecker.getTypeAtLocation(classDecl);

      ts.forEachChild(child, (methodDecl) => {
        if (!ts.isMethodDeclaration(methodDecl)) return;

        const methodName = (methodDecl.name as any).escapedText;
        const isInvalidMethod = ['getselfcontext', 'getpaginatedresponse'].some(
          (invalidName) => methodName.toLowerCase().includes(invalidName)
        );
        const validMethodPrefix = [
          'get',
          'create',
          'update',
          'delete',
          'find',
          'import',
          'bulkimport',
          'upload',
        ].some((validPrefix) =>
          methodName.toLowerCase().startsWith(validPrefix)
        );
        if (isInvalidMethod || !validMethodPrefix) return;

        const methodSig = typeChecker.getSignatureFromDeclaration(methodDecl);
        if (!methodSig) return;

        const methodReturnType = methodSig?.getReturnType();

        let typeDecl = typeChecker.typeToString(
          methodReturnType,
          methodDecl, // require the node in order to create union with null
          ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.InTypeAlias |
            ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
            ts.NodeBuilderFlags.NoTypeReduction
        );

        // strip Promise<> wrapper
        const promiseRegex = new RegExp(/Promise<(.*)>/gm);
        const group = promiseRegex.exec(typeDecl);
        if (group && group[1]) {
          typeDecl = group[1];
        }
        if (typeDecl.includes('void')) {
          return;
        }

        writeStream.write(
          `export type ${child.name?.escapedText}${methodName
            .charAt(0)
            .toUpperCase()}${methodName.slice(1)} = ${typeDecl};\n`
        );
      });
    });
  });

  function processTypeDeclaration(
    node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration,
    typeName: string,
    forceOverride: boolean
  ) {
    const type = typeChecker.getTypeAtLocation(node);

    const childProps = type.getProperties();
    if (
      (forceOverride ||
        typeName.endsWith('Attr') ||
        typeName.endsWith('Biz') ||
        typeName === 'Pagination' ||
        typeName === 'PaginationResponse' ||
        typeName === 'MerchantOutput' ||
        typeName === 'TreasuryOutput' ||
        typeName === 'ReportOutput' ||
        typeName === 'Self') &&
      childProps.length
    ) {
      const childTypes = childProps.map((childProp) => {
        const jsDocs = childProp.getJsDocTags().map((tag) => {
          const jsDoc = ts.displayPartsToString(tag.text);
          return `@${tag.name} ${jsDoc}`;
        });

        let typeComment = '';
        typeComment = ts.displayPartsToString(
          childProp.getDocumentationComment(typeChecker)
        );

        let stringType;
        if (jsDocs.length || typeComment) {
          stringType = '/**';

          if (typeComment) {
            typeComment.split('\n').forEach((comment) => {
              stringType += `\n * ${comment}`;
            });
          }

          jsDocs.forEach((doc) => {
            stringType += `\n * ${doc}`;
          });
          stringType += '\n */';
        }

        const childType = typeChecker.getTypeOfSymbolAtLocation(
          childProp,
          node
        );
        let typeDecl = typeChecker.typeToString(
          childType,
          node,
          ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.InTypeAlias |
            ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
        );

        const hasUndefined = typeDecl.endsWith('| undefined');
        // appending ? instead
        if (hasUndefined) {
          typeDecl = typeDecl.replace('| undefined', '');
        }

        const childPropName = hasUndefined
          ? childProp.name + '?'
          : childProp.name;
        const childTypeDecl = `${childPropName}: ${typeDecl};`;
        if (stringType) {
          return `${stringType}\n${childTypeDecl}`;
        } else {
          return childTypeDecl;
        }
      });

      const fullType = `type ${typeName} = {\n${childTypes.join('\n')}\n};`;
      writeStream.write(`export ${fullType}\n`);
    } else {
      const symbol = typeChecker.getSymbolAtLocation(node.name);
      let typeComment = '';
      if (symbol) {
        typeComment = ts.displayPartsToString(
          symbol.getDocumentationComment(typeChecker)
        );
      }

      const typeDecl = typeChecker.typeToString(
        type,
        node,
        ts.TypeFormatFlags.NoTruncation |
          ts.TypeFormatFlags.InTypeAlias |
          ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
      );

      let fullExport = '';
      if (typeComment) {
        const description = typeComment
          .split('\n')
          .map((comment) => `* ${comment}\n`);
        fullExport = `/**\n ${description.join('')} */\n`;
      }
      fullExport += `export type ${typeName} = ${typeDecl};\n`;
      writeStream.write(fullExport);
    }
  }

  writeStream.end();
}
