import {
  Children,
  OutputSymbol,
  OutputSymbolOptions,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
} from "@alloy-js/core";

export interface CreatePythonSymbolOptions extends OutputSymbolOptions {
  module?: string;
  children?: Children;
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
}
