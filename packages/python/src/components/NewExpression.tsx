import {
  emitSymbol,
  instantiateTakenMembersTo as instantiateTakenSymbolsTo,
  OutputSymbolFlags,
} from "@alloy-js/core";
import { PythonOutputSymbol } from "../symbols/python-output-symbol.js";
import {
  FunctionCallExpression,
  FunctionCallExpressionProps,
} from "./FunctionCallExpression.jsx";

export interface NewExpressionProps extends FunctionCallExpressionProps {}

// NewExpression is used to create new instances of classes in Python.
// It is similar to FunctionCallExpression but specifically for class instantiation.
// Args is a list arguments that can be either Values, which will render as positional arguments,
// or VariableDeclarations, which will render as named arguments in the call statement.
export function NewExpression(props: NewExpressionProps) {
  const sym = new PythonOutputSymbol("", {
    flags: OutputSymbolFlags.Transient,
  });
  instantiateTakenSymbolsTo(sym);
  emitSymbol(sym);
  return (
    <>
      <FunctionCallExpression {...props} />
    </>
  );
}
