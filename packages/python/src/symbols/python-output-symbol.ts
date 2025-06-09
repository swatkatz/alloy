import {
  Children,
  OutputScopeFlags,
  OutputSymbol,
  OutputSymbolOptions,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
} from "@alloy-js/core";
import { PythonMemberScope } from "./python-member-scope.js";

// prettier-ignore
export enum PythonSymbolFlags {
  None         = 0,
  LocalImport  = 1 << 0, // Symbol is imported from another module
  ClassMember  = 1 << 1, // Symbol is a member of a class
  Function     = 1 << 2, // Symbol is a function (not a class, module, or param)
  Parameter    = 1 << 3, // Symbol is a parameter in a function/method
  Private      = 1 << 4, // Symbol name starts with '_' (conventionally private)
  ModuleLevel  = 1 << 5, // Symbol is defined at module global scope
  Dunder       = 1 << 6, // Symbol is a "dunder" (double-underscore) name
  PrivateMemberContainer = 1 << 7, // Symbol is a container for private members
  Nullish      = 1 << 8, // Symbol is 'None'
}

export interface CreatePythonSymbolOptions extends OutputSymbolOptions {
  module?: string;
  children?: Children;
  pythonFlags?: PythonSymbolFlags;
}

export interface CreatePythonSymbolFunctionOptions extends CreatePythonSymbolOptions {
  name: string;
}

/**
 * Represents an 'exported' symbol from a .py file. Class, enum, interface etc.
 */
export class PythonOutputSymbol extends OutputSymbol {
  constructor(name: string, options: CreatePythonSymbolOptions) {
    super(name, options);
    this.#children = !!options.children;
    this.#module = options.module ?? undefined;
    this.#pythonFlags = options.pythonFlags ?? PythonSymbolFlags.None;
    this.#privateMemberScope = undefined;

    if (this.#pythonFlags & PythonSymbolFlags.PrivateMemberContainer) {
      this.#privateMemberScope = new PythonMemberScope("private members", {
        binder: this.binder,
        owner: this,
        flags: OutputScopeFlags.InstanceMemberScope,
      });
    }
  }

  #pythonFlags: PythonSymbolFlags;
  get pythonFlags() {
    track(this, TrackOpTypes.GET, "pythonFlags");
    return this.#pythonFlags;
  }
  set pythonFlags(value: PythonSymbolFlags) {
    const oldValue = this.#pythonFlags;
    if (oldValue === value) {
      return;
    }
    this.#pythonFlags = value;
    trigger(this, TriggerOpTypes.SET, "pythonFlags", value, oldValue);
  }

  #children: boolean;
  get children() {
    track(this, TrackOpTypes.GET, "children");
    return this.#children;
  }

  set children(value: boolean) {
    if (this.#children === value) {
      return;
    }
    this.#children = value;
    trigger(this, TriggerOpTypes.SET, "children", value, !value);
  }

  // The module in which the symbol is defined
  #module?: string;

  get module() {
    return this.#module;
  }

  set module(value: string | undefined) {
    this.#module = value;
  }

  get instanceMemberScope() {
    return super.instanceMemberScope as PythonMemberScope | undefined;
  }

  #privateMemberScope: PythonMemberScope | undefined;
  get privateMemberScope() {
    return this.#privateMemberScope;
  }

  protected createMemberScope(
    name: string,
    options: { owner?: OutputSymbol; flags?: OutputScopeFlags },
  ): PythonMemberScope {
    return new PythonMemberScope(name, {
      ...options,
    });
  }
}
