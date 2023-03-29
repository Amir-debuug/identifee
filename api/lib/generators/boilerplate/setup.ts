import {
  forEachStructureChild,
  Project,
  Structure,
  TypeLiteralNode,
} from 'ts-morph';

export function writeToIndex(
  project: Project,
  directory: string,
  fileName: string
) {
  const bizIndexFile = project.getSourceFileOrThrow(`${directory}/index.ts`);
  const hasFile = bizIndexFile.getText().includes(fileName.replace('.ts', ''));

  if (hasFile) {
    return;
  }

  let previous;
  forEachStructureChild(bizIndexFile.getStructure(), (child) => {
    if (
      Structure.isExportDeclaration(child) &&
      !child.namespaceExport &&
      child.moduleSpecifier
    ) {
      if (child.moduleSpecifier < `./${fileName}`.replace('.ts', '')) {
        previous = child;
      }
    }
  });

  const previousNode = bizIndexFile.getExportDeclarationOrThrow(
    previous.moduleSpecifier
  );

  previousNode.replaceWithText((writer) => {
    writer.writeLine(previousNode.getFullText().replace('\n', ''));
    writer.write(`export * from './${fileName.replace('.ts', '')}';`);
  });
  bizIndexFile.saveSync();
}

export function writeNamedImport(
  project: Project,
  file: string,
  importPath: string,
  className: string
) {
  const contextTypesSource = project.getSourceFileOrThrow(file);
  const importNode = contextTypesSource.getImportDeclarationOrThrow(importPath);
  const hasImport = importNode.getNamedImports().some((namedImport) => {
    return namedImport.getName() === className;
  });
  if (!hasImport) {
    importNode.replaceWithText((writer) => {
      const textLines = importNode.getFullText().split('\n');

      let previous: { idx: number; line: string } = {} as any;
      textLines.forEach((line, idx) => {
        if (line.replace(/\s/g, '') < className) {
          previous = {
            line,
            idx,
          };
        }
      });
      if (previous.idx) {
        textLines.splice(previous.idx + 1, 0, `  ${className},`);
        writer.write(textLines.join('\n'));
      }
    });
  }
  contextTypesSource.saveSync();
}

export function writeContextServiceType(
  project: Project,
  file: string,
  type: 'biz' | 'dao',
  className: string
) {
  const contextTypesSource = project.getSourceFileOrThrow(file);
  const exportType = contextTypesSource.getTypeAliasOrThrow('ContextServices');
  const typeProp = (
    exportType.getTypeNodeOrThrow() as TypeLiteralNode
  ).getProperty(type);

  if (!typeProp) {
    throw new Error('invalid');
  }

  let classKey = className.replace(
    type.charAt(0).toLowerCase() + type.slice(1),
    ''
  );
  classKey = classKey.charAt(0).toLowerCase() + classKey.slice(1);

  const classProp = (
    typeProp.getTypeNodeOrThrow() as TypeLiteralNode
  ).getProperty(classKey);
  if (!classProp) {
    typeProp.replaceWithText((writer) => {
      let textLines = typeProp.getFullText().split('\n');
      textLines = textLines.map((line) => line.replace(/^\s{4}|^\s{2}/g, ''));
      textLines.pop();
      textLines.push('};');

      let previous: { idx: number; line: string } = {} as any;
      textLines.forEach((line, idx) => {
        if (line.replace(/\s/g, '') < classKey) {
          previous = {
            line,
            idx,
          };
        }
      });
      if (previous.idx) {
        textLines.splice(previous.idx + 1, 0, `${classKey}: ${className};`);
        writer.write(textLines.splice(1).join('\n'));
      }
    });
  }
  contextTypesSource.saveSync();

  const exportNode = exportType.getTypeNodeOrThrow();
  exportNode.replaceWithText((writer) => {
    const textLines = exportNode.getFullText().split('\n');
    let isKey = false;
    let keyIdx;
    let innerCount = 0;
    textLines.forEach((textLine, idx) => {
      if (textLine.includes(type)) {
        isKey = true;
      } else {
        if (isKey) {
          if (textLine.includes('{')) {
            innerCount++;
          }
          if (innerCount === 0 && textLine.includes('};')) {
            isKey = false;
            keyIdx = idx;
          }
          if (textLine.includes('}')) {
            innerCount--;
          }
        }
      }
    });
    textLines[0] = '{';
    textLines[keyIdx] = '  };';
    writer.write(textLines.join('\n'));
  });

  contextTypesSource.saveSync();
}
