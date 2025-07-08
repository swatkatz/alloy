import {
  Block,
  Children,
  List,
  MemberDeclaration,
  Name,
  OutputSymbolFlags,
  Refkey,
  Scope,
  childrenArray,
  refkey,
  splitProps,
  takeSymbols,
  useContext,
  useMemberScope,
} from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { PythonOutputSymbol } from "../symbols/index.js";
import { PythonOutputScope } from "../symbols/scopes.js";
import { getCallSignatureProps } from "../utils.js";
import { CallSignature, CallSignatureProps } from "./CallSignature.jsx";
import {
  BaseDeclarationProps,
  Declaration,
  DeclarationProps,
} from "./Declaration.js";
import { PropertyName } from "./PropertyName.jsx";
import { SourceFileContext } from "./SourceFile.jsx";
import { TypeRefContext } from "./TypeRefContext.jsx";
import { VariableDeclaration } from "./VariableDeclaration.jsx";

export interface ClassDeclarationProps extends BaseDeclarationProps {
  /**
   * The classes that this class extends.
   */
  bases?: Children[];
}

/**
 * Create a Python class declaration.
 *
 * @example
 * ```tsx
 * <ClassDeclaration name="MyClass" bases={["BaseClass"]}>
 *   <VariableDeclaration name="a" type="int" />
 *   <VariableDeclaration name="b" type="str" />
 *   <py.ClassMethod name="my_method" parameters={[{ name: "a", type: "int" }, { name: "b", type: "str" }]} returnType="int">
 *     return a + b
 *   </ClassMethod>
 * </ClassDeclaration>
 * ```
 * renders to
 * ```py
 * class MyClass(BaseClass):
 *   a: int = None
 *   b: str = None
 *   def my_method(self, a: int, b: str) -> int:
 *     return a + b
 * ```
 * @remarks
 *
 * Any parameters or type parameters declared in this signature will be placed
 * in the current scope. This component does not make a scope to hold its
 * parameters.
 */
export function ClassDeclaration(props: ClassDeclarationProps) {
  const name = usePythonNamePolicy().getName(props.name!, "class");
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  const basesPart = props.bases && (
    <>
      (<List children={props.bases} comma space />)
    </>
  );

  const sym = new PythonOutputSymbol(name, {
    refkeys: props.refkey ?? refkey(name),
    flags:
      (props.flags ?? OutputSymbolFlags.None) |
      OutputSymbolFlags.MemberContainer,
    module: module,
  });

  takeSymbols((memberSymbol) => {
    // Transform emitted symbols into instance/class members
    memberSymbol.flags |= OutputSymbolFlags.InstanceMember;
  });
  
  // Propagate the name after the name policy was applied
  const updatedProps: DeclarationProps = {
    ...props,
    name: name,
    nameKind: "class",
  };
  const hasChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;

  return (
    <Declaration symbol={sym}>
      class <Name />
      <Scope name={updatedProps.name} kind="class">
        {basesPart}
        <Block opener=":" closer="">
          {hasChildren ? props.children : "pass"}
        </Block>
      </Scope>
    </Declaration>
  );
}
