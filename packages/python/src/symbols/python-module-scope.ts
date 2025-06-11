import { Binder, OutputScope, reactive, shallowReactive } from "@alloy-js/core";
import { PythonOutputSymbol } from "./python-output-symbol.js";

export class ImportedSymbol {
  local?: PythonOutputSymbol;  // The alias of the target symbol, if it exists
  target: PythonOutputSymbol;

  constructor(target: PythonOutputSymbol, local?: PythonOutputSymbol) {
    this.target = target;
    this.local = local;
  }

  static from(target: PythonOutputSymbol, local?: PythonOutputSymbol) {
    return new ImportedSymbol(target, local);
  }
}

export interface ImportRecordProps {
  symbols: Set<ImportedSymbol>;
  pathAlias?: string; // Alias for the module itself (if importing the whole module)
  wildcard?: boolean; // If true, use '*'
}

export type ImportRecords = Map<PythonModuleScope, ImportRecordProps>;

export const ImportRecords = Map as {
  new (): ImportRecords;
  new (entries?: readonly (readonly [PythonModuleScope, ImportRecordProps])[] | null): ImportRecords;
  prototype: Map<PythonModuleScope, ImportRecordProps>;
};

export class PythonModuleScope extends OutputScope {
  get kind() {
    return "module" as const;
  }
}
