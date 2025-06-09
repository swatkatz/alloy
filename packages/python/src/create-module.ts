// Declare libraries (dependencies) that you are adding to the project.
// Allows discovery of symbols from these libraries for use in the program

import {
  type Binder,
  getSymbolCreatorSymbol,
  OutputSymbolFlags,
  type Refkey,
  refkey,
  SymbolCreator,
} from "@alloy-js/core";
import { PythonModuleScope, PythonOutputSymbol, PythonOutputScope, ref } from "./symbols/index.js";
import { createPythonModuleScope } from "./symbols/python-module-scope.js";

export interface ModuleDescriptor {
  [path: string]: ModuleSymbolsDescriptor;
}

/**
 * Describes the structure of a module descriptor.
 *
 * A module descriptor can either be a string (representing the module name)
 * or an object with the following properties:
 * - `name`: The name of the module.
 * - `instanceMembers`: An optional array of named module descriptors representing
 *  instance members of the module.
 */
export type NamedModuleDescriptor =
  | string
  | {
      name: string;
      instanceMembers?: Array<NamedModuleDescriptor>;
    };

export interface ModuleSymbolsDescriptor {
  default?: string;
  named?: NamedModuleDescriptor[];
}

/**
 * Props for creating a package with a specific name, version, and descriptor.
 */
export interface CreateModuleProps<T extends ModuleDescriptor> {
  name: string;
  version: string;
  descriptor: T;
  builtin?: boolean;
}

/**
 * Infers the exported members of a module based on its descriptor.
 *
 * D - The module descriptor, which may specify a `default` export (as a string)
 *   and/or an array of named exports (`named`).
 *
 * If `D` includes a `default` property of type `string`, the resulting type will include a
 * `default` property of type `Refkey`. If `D` includes a `named` property (an array of
 * `NamedModuleDescriptor`), the resulting type will include the mapped named exports as
 * defined by `NamedMap`.
 */
export type ModuleExports<
  D extends { default?: string; named?: NamedModuleDescriptor[] },
> = (D extends { default: string } ? { default: Refkey } : {}) &
  (D["named"] extends NamedModuleDescriptor[] ? NamedMap<D["named"]> : {});

export type ModuleRefkeys<
  PD extends Record<
    string,
    { default?: string; named?: NamedModuleDescriptor[] }
  >,
  // “Root” module descriptor at key `"."` becomes the “flat” exports on mcpSdk.*
> = ModuleExports<PD["."]> & {
  // Every other module-path (e.g. "./foo/bar.js") lives under its own index:
  //    mcpSdk["./foo/bar.js"].<exports>
  [P in keyof PD as P extends "." ? never : P]: ModuleExports<PD[P]>;
};

// NamedMap is a utility type that maps the named module descriptors
// to their corresponding Refkey types. It handles both string and object
// entries in the array of named module descriptors.
// It creates a mapping where:
// For each TDescriptor extends NamedModuleDescriptor[]:
//   • string entries ➜ { [s]: Refkey }
//   • object entries ➜ { [name]: Refkey & { static: …; instance: … } }
export type NamedMap<TDescriptor extends readonly NamedModuleDescriptor[]> =
  // plain-string exports
  {
    [S in Extract<TDescriptor[number], string>]: Refkey;
  } & {
    [O in Extract<
      TDescriptor[number],
      { name: string }
    > as O["name"]]: Refkey & {
      instance: O extends (
        { instanceMembers: infer IM extends NamedModuleDescriptor[] }
      ) ?
        NamedMap<IM>
      : {};
    };
  };

function assignMembers(
  binder: Binder,
  ownerSym: PythonOutputSymbol,
  members: NamedModuleDescriptor[],
  keys: Record<string, any>,
) {
  let scope: PythonOutputScope;
  ownerSym.flags |= OutputSymbolFlags.InstanceMemberContainer;
  scope = ownerSym.instanceMemberScope!;

  const namespace = "instance";

  for (const member of members) {
    const memberObj = typeof member === "object" ? member : { name: member };

    // The refkey is located in the appropriate namespace
    const memberKey = keys[namespace][memberObj.name];
    if (!memberKey) continue; // Skip if key doesn't exist

    let memberFlags = OutputSymbolFlags.InstanceMember;
    if (memberObj.instanceMembers?.length) {
      memberFlags |= OutputSymbolFlags.InstanceMemberContainer;
    }

    const memberSym = new PythonOutputSymbol(memberObj.name, {
      scope,
      binder,
      refkeys: memberKey,
      flags: memberFlags,
    });

    scope.symbols.add(memberSym);

    // Recursively handle nested instance members
    if (memberObj.instanceMembers) {
      assignMembers(
        binder,
        memberSym,
        memberObj.instanceMembers,
        keys[namespace][memberObj.name],
      );
    }
  }
}

function createSymbols(
  binder: Binder,
  props: CreateModuleProps<ModuleDescriptor>,
  refkeys: Record<string, any>,
) {
  for (const [path, symbols] of Object.entries(props.descriptor)) {
    const keys = path === "." ? refkeys : refkeys[path];
    const moduleScope = new PythonModuleScope(path, {
      parent: undefined,
      binder: binder,
    });

    for (const exportedName of symbols.named ?? []) {
      const namedRef =
        typeof exportedName === "string" ?
          { name: exportedName }
        : exportedName;
      const key = keys[namedRef.name];

      let flags = OutputSymbolFlags.None;
      if (namedRef.instanceMembers?.length) {
        flags |= OutputSymbolFlags.InstanceMemberContainer;
      }

      const ownerSym = new PythonOutputSymbol(namedRef.name, {
        binder: binder,
        scope: moduleScope,
        refkeys: key,
        module: moduleScope.name,
      });

      assignMembers(
        binder,
        ownerSym,
        namedRef.instanceMembers ?? [],
        keys[namedRef.name],
      );
    }
  }
}

function createRefkeysForMembers(
  members: NamedModuleDescriptor[],
  keys: Record<string, any>,
  namespace: "instance",
) {
  keys[namespace] ??= {};

  for (const member of members) {
    const memberObj = typeof member === "string" ? { name: member } : member;
    const memberKey = refkey();
    keys[namespace][memberObj.name] = memberKey;

    if (memberObj.instanceMembers?.length) {
      createRefkeysForMembers(memberObj.instanceMembers, memberKey, "instance");
    }
  }
}

export function createModule<const T extends ModuleDescriptor>(
  props: CreateModuleProps<T>,
): ModuleRefkeys<T> & SymbolCreator {
  const refkeys: any = {
    [getSymbolCreatorSymbol()](binder: Binder) {
      createSymbols(binder, props, refkeys);
    },
  };

  for (const [path, symbols] of Object.entries(props.descriptor)) {
    const keys = path === "." ? refkeys : (refkeys[path] = {});
    for (const named of symbols.named ?? []) {
      const namedObj = typeof named === "string" ? { name: named } : named;
      keys[namedObj.name] = refkey(props.descriptor, path, namedObj);
      if (namedObj.instanceMembers?.length) {
        createRefkeysForMembers(
          namedObj.instanceMembers,
          keys[namedObj.name],
          "instance",
        );
      }

      keys[namedObj.name][getSymbolCreatorSymbol()] = (
        binder: Binder,
        parentSym: PythonOutputSymbol,
      ) => {
        if (namedObj.instanceMembers?.length) {
          assignMembers(
            binder,
            parentSym,
            namedObj.instanceMembers,
            keys[namedObj.name],
          );
        }
      };
    }
  }

  return refkeys;
}
