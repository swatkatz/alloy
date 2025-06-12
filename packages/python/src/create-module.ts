import {
  type Binder,
  getSymbolCreatorSymbol,
  type Refkey,
  refkey,
  SymbolCreator,
} from "@alloy-js/core";
import { PythonModuleScope, PythonOutputSymbol } from "./symbols/index.js";

export interface ModuleDescriptor {
  [path: string]: string[];
}

export interface CreateModuleProps<T extends ModuleDescriptor> {
  name: string;
  descriptor: T;
}

export type NamedMap<TDescriptor extends readonly string[]> = {
  [S in TDescriptor[number]]: Refkey;
};

export type ModuleRefkeys<PD extends Record<string, string[]>> = {
  [P in keyof PD]: NamedMap<PD[P]>;
};

function createSymbols(
  binder: Binder,
  props: CreateModuleProps<ModuleDescriptor>,
  refkeys: Record<string, any>,
) {
  // Create a module scope for each path in the descriptor
  for (const [path, symbols] of Object.entries(props.descriptor)) {
    // If the path is ".", we use the module name directly
    // Otherwise, we append the path to the module name
    const fullModuleScopeName = props.name + (path === "." ? "" : `.${path}`);
    const keys = refkeys[path];
    const moduleScope = new PythonModuleScope(fullModuleScopeName, {
      parent: undefined,
      binder: binder,
    });

    // Create a symbol for each exported name
    for (const exportedName of symbols ?? []) {
      const key = keys[exportedName];

      const _ = new PythonOutputSymbol(exportedName, {
        binder: binder,
        scope: moduleScope,
        refkeys: key,
        module: moduleScope.name,
      });
    }
  }
}

// Creates a map of refkeys for each path in the descriptor
export function createModule<const T extends ModuleDescriptor>(
  props: CreateModuleProps<T>,
): ModuleRefkeys<T> & SymbolCreator {
  const refkeys: any = {
    [getSymbolCreatorSymbol()](binder: Binder) {
      createSymbols(binder, props, refkeys);
    },
  };

  for (const [path, symbols] of Object.entries(props.descriptor)) {
    const keys: Record<string, Refkey> = (refkeys[path] = {});
    for (const named of symbols ?? []) {
      keys[named] = refkey(props.descriptor, path, named);
    }
  }

  return refkeys;
}
