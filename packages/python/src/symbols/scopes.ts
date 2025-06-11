import { OutputScope, useScope } from "@alloy-js/core";
import { PythonMemberScope } from "./python-member-scope.js";
import { PythonModuleScope } from "./python-module-scope.js";

export type PythonOutputScope =
  | PythonGlobalScope
  | PythonModuleScope
  | PythonFunctionScope
  | PythonMemberScope;

export interface PythonGlobalScope extends OutputScope {
  kind: "global";
}

export interface PythonFunctionScope extends OutputScope {
  kind: "function";
}

export function usePythonScope() {
  return useScope() as PythonOutputScope;
}
