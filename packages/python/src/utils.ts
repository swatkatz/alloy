import { SourceFileContext } from "@alloy-js/core";
import {
  PythonElements,
  usePythonNamePolicy
} from "./name-policy.js";


export function getFormattedName(
  name: string,
  nameKind: PythonElements,
): string {
  return usePythonNamePolicy().getName(name, nameKind);
}

export function getModuleName(fileContext: SourceFileContext | undefined, name?: string): string{
  return name ?? (fileContext ? fileContext.path.replace(/\.py$/, "") : "");
}