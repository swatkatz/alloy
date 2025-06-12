import {
  memo,
  OutputSymbolFlags,
  Refkey,
  resolve,
  untrack,
  useContext,
  useMemberScope,
} from "@alloy-js/core";
import { SourceFileContext } from "../components/SourceFile.jsx";
import { PythonOutputScope } from "./scopes.js";
import { PythonMemberScope } from "./python-member-scope.js";
import { PythonModuleScope } from "./python-module-scope.js";
import { PythonOutputSymbol } from "./python-output-symbol.js";

export function ref(
  refkey: Refkey,
): () => [string, PythonOutputSymbol | undefined] {
  const sourceFile = useContext(SourceFileContext);
  const resolveResult = resolve<PythonOutputScope, PythonOutputSymbol>(
    refkey as Refkey,
  );
  const currentScope = useMemberScope();

  return memo(() => {
    if (resolveResult.value === undefined) {
      return ["<Unresolved Symbol>", undefined];
    }

    const { targetDeclaration, pathDown, memberPath } = resolveResult.value;

    // Where the target declaration is relative to the referencing scope.
    // * module: target symbol is in a different module
    // * local: target symbol is within the current module
    const targetLocation = pathDown[0]?.kind ?? "local";
    let localSymbol: PythonOutputSymbol | undefined;

    if (targetLocation === "module") {
      const symbolPath = [
        ...(pathDown.slice(1) as PythonMemberScope[]).map((s) => s.owner),
        targetDeclaration,
      ];

      const importSymbol = symbolPath[0];

      localSymbol = untrack(() =>
        sourceFile!.scope.addImport(
          importSymbol,
          pathDown[0] as PythonModuleScope,
        ),
      );
    }

    if (memberPath && memberPath.length > 0) {
      if (localSymbol) {
        memberPath[0] = localSymbol;
      }

      return [buildMemberExpression(memberPath), memberPath.at(-1)];
    } else {
      return [
        buildMemberExpression([localSymbol ?? targetDeclaration]),
        localSymbol ?? targetDeclaration,
      ];
    }
  });
}

function buildMemberExpression(path: PythonOutputSymbol[]) {
  let memberExpr = "";

  const base = path[0];
  if (base.flags & OutputSymbolFlags.InstanceMember) {
    memberExpr += "this";
  } else {
    memberExpr += base.name;
    path = path.slice(1);
  }

  return memberExpr;
}
