import {
  type Binder,
  getSymbolCreatorSymbol,
  type Refkey,
  refkey,
  SymbolCreator,
} from "@alloy-js/core";
import { PythonModuleScope, PythonOutputSymbol } from "./symbols/index.js";

export interface ModuleDescriptor {
  [path: string]: ModuleSymbolsDescriptor;
}

export type NamedModuleDescriptor = string;

export interface ModuleSymbolsDescriptor {
  named?: NamedModuleDescriptor[];
}

export interface CreateModuleProps<T extends ModuleDescriptor> {
  name: string;
  version: string;
  descriptor: T;
}

export type ModuleExports<
  D extends { named?: NamedModuleDescriptor[] },
> = D["named"] extends NamedModuleDescriptor[] ? NamedMap<D["named"]> : {};

export type ModuleRefkeys<
  PD extends Record<
    string,
    { named?: NamedModuleDescriptor[] }
  >,
> = {
  [P in keyof PD]: ModuleExports<PD[P]>;
};

export type NamedMap<TDescriptor extends readonly NamedModuleDescriptor[]> = {
  [S in TDescriptor[number]]: Refkey;
};

function createSymbols(
  binder: Binder,
  props: CreateModuleProps<ModuleDescriptor>,
  refkeys: Record<string, any>,
) {
  // Create a module scope each of the names in the descriptor
  for (const [path, symbols] of Object.entries(props.descriptor)) {
    const keys = path === "." ? refkeys : refkeys[path];
    const moduleScope = new PythonModuleScope(path, {
      parent: undefined,
      binder: binder,
    });

    // Creates a symbol for each element in the named array
    for (const exportedName of symbols.named ?? []) {
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
    for (const named of symbols.named ?? []) {
      keys[named] = refkey(props.descriptor, path, named);
    }
  }

  return refkeys;
}
