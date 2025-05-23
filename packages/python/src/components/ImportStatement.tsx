import { computed, JSX, mapJoin, memo } from "@alloy-js/core";
import { useSourceFileContext } from "./SourceFile.js";
import { createPythonSymbol } from "../symbols/index.js";


export interface ImportSymbol {
  module: string; // The module to import from
  names?: Array<string | { name: string; alias?: string }>; // Items to import
  alias?: string; // Alias for the module itself (if importing the whole module)
  wildcard?: boolean; // If true, use '*'
}

export interface ImportStatementsProps {
  imports: ImportSymbol[];
}

/**
 * Represents a Python import statement.
 * Generates an import statement for the given module and names.
 */
export function ImportStatements(props: ImportStatementsProps): JSX.Element {
  const imports = computed(() =>
    props.imports.sort((a, b) => a.module.localeCompare(b.module)),
  );

  return mapJoin(
    () => imports.value,
    (importProp) => <ImportStatement {...importProp} />,
  );
}

export function ImportStatement(props: ImportSymbol) {
  const sfContext = useSourceFileContext();
  return memo(() => {
    const { module, names, alias, wildcard } = props;

    const parts: any[] = [];

    if (wildcard) {
      sfContext.addImport(
        createPythonSymbol({
          name: '*',
          module: module,
        }),
      );
      parts.push(`from ${module} import *`);
    } else if (!names || names.length === 0) {
      sfContext.addImport(
        createPythonSymbol({
          name: '',
          module: module,
        }),
      );
      parts.push(`import ${module}`);
    } else {
      const formattedNames = names
        .map((name) =>
          typeof name === "string" ? name
          : name.alias ? `${name.name} as ${name.alias}`
          : name.name,
        )
        .join(", ");

      if (alias) {
        sfContext.addImport(
          createPythonSymbol({
            name: formattedNames,
            module: module,
          }),
        );
        parts.push(`from ${module} import ${formattedNames} as ${alias}`);
      } else {
        sfContext.addImport(
          createPythonSymbol({
            name: formattedNames,
            module: module,
          }),
        );
        parts.push(`from ${module} import ${formattedNames}`);
      }
    }
    return parts;
  });
}
