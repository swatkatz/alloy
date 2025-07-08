import {
  childrenArray,
  emitSymbol,
  findUnkeyedChildren,
  Name,
  OutputScope,
  OutputSymbolFlags,
  Scope,
  useContext,
  useMemberScope,
  useScope,
  type Children,
} from "@alloy-js/core";
import { PythonOutputSymbol } from "../symbols/index.js";
import { getCallSignatureProps } from "../utils.js";
import { CallSignature, CallSignatureProps } from "./CallSignature.jsx";
import { BaseDeclarationProps, Declaration } from "./Declaration.js";
import { SourceFileContext } from "./SourceFile.js";
import { PythonBlock } from "./PythonBlock.jsx";
import { usePythonNamePolicy } from "../name-policy.js";

export interface FunctionDeclarationProps
  extends BaseDeclarationProps,
    CallSignatureProps {
  async?: boolean;
  forceName?: boolean; // if true, the name will not be transformed by the name policy
}

/**
 * A Python function declaration.
 *
 * @example
 * ```tsx
 * <FunctionDeclaration
 *  name="my_function"
 *  returnType="int"
 *  parameters=[{name: "a", type: "int"},{name: "b", type: "str"}]>
 *   return a + b
 * </FunctionDeclaration>
 * ```
 * This will generate:
 * ```python
 * def my_function(a: int, b: str) -> int:
 *   return a + b
 * ```
 */
export function FunctionDeclaration(props: FunctionDeclarationProps) {
  const asyncKwd = props.async ? "async " : "";
  let sym: PythonOutputSymbol | undefined = undefined;
  const callSignatureProps = getCallSignatureProps(props, {});
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  let name = usePythonNamePolicy().getName(props.name, "function");
  const memberScope = useMemberScope();
  let scope: OutputScope | undefined = undefined;
  if (memberScope !== undefined) {
    scope = memberScope.instanceMembers!;
  }
  else {
    scope = useScope();
  }
  
  if (props.forceName) {
    name = props.name;
  }
  sym = new PythonOutputSymbol(name, {
    scope: scope,
    refkeys: props.refkey,
    flags:
      (props.flags ?? OutputSymbolFlags.None),
    module: module,
  });
  emitSymbol(sym);

  return (
    <>
      <Declaration {...props} nameKind="function" symbol={sym}>
        {asyncKwd}def <Name />
        <Scope name={props.name} kind="function">
          <CallSignature {...callSignatureProps} returnType={props.returnType} />
          {":"}
          <PythonBlock>
            {props.children ?? "pass"}
          </PythonBlock>
        </Scope>
      </Declaration>
    </>
  );
}

/**
 * A Python `__init__` function declaration.
 *
 * @example
 * ```tsx
 * <InitFunctionDeclaration>
 *   self.attribute = "value"
 * </InitFunctionDeclaration>
 * ```
 * This will generate:
 * ```python
 * def __init__(self: MyClass) -> None:
 *     self.attribute = "value"
 * ```
 * 
 * @remarks
 *
 * This is a convenience component that sets the name to `__init__`, marks it as
 * an instance function, and forces the name to be `__init__` without applying
 * the name policy.
 */
export function InitFunctionDeclaration(
  props: Omit<
    FunctionDeclarationProps,
    "name" | "instanceFunction" | "classFunction"
  >,
) {
  return (
    <FunctionDeclaration
      {...props}
      name="__init__"
      instanceFunction={true}
      classFunction={false}
      forceName={true}
    />
  );
}
