import { Children, Output, SymbolCreator } from "@alloy-js/core";
import { createPythonNamePolicy } from "../name-policy.js";

export function createPythonOutput(children: Children, externals?: SymbolCreator[]): Children {
  return (
    <Output externals={externals} namePolicy={createPythonNamePolicy()}>
      {children}
    </Output>
  );
}