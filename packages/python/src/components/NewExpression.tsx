import {
  emitSymbol,
  instantiateTakenMembersTo as instantiateTakenSymbolsTo,
  OutputSymbolFlags,
  useContext,
} from "@alloy-js/core";
import { PythonOutputSymbol } from "../symbols/python-output-symbol.js";
import {
  FunctionCallExpression,
  FunctionCallExpressionProps,
} from "./FunctionCallExpression.jsx";
import { SourceFileContext } from "./SourceFile.jsx";

export interface NewExpressionProps extends FunctionCallExpressionProps {}

/**
 * Used to create new instances of classes in Python.
 * 
 * @remarks
 * 
 * It is similar to FunctionCallExpression but specifically for class instantiation.
 * Args is a list arguments that can be either Values, which will render as positional arguments,
 * or VariableDeclarations, which will render as named arguments in the call statement.
 */
export function NewExpression(props: NewExpressionProps) {
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  const sym = new PythonOutputSymbol("", {
    flags: OutputSymbolFlags.Transient,
    module: module,
  });
  instantiateTakenSymbolsTo(sym);
  emitSymbol(sym);
  return (
    <>
      <FunctionCallExpression {...props} />
    </>
  );
}
