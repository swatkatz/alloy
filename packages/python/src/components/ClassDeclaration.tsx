import {
  childrenArray,
  Children,
  Indent,
  List,
  OutputSymbolFlags,
  BlockProps,
  computed,
  useContext,
  SourceFileContext,
  refkey,
  Name
} from "@alloy-js/core";
import { PythonOutputSymbol } from "../symbols/python-output-symbol.js";
import {
  Declaration,
  BaseDeclarationProps
} from "./Declaration.js";
import {
  getFormattedName,
  getModuleName
} from "../utils.js";

export interface ClassDeclarationProps extends BaseDeclarationProps {
  bases?: Children[];
}

/** For some reason, when rendering a Block in the Python implementation,
 * it renders a newline after the last line. That doesn't seems to happen
 * in the other language implementations. We are adding this class so we can
 * remove the newline when rendering a ClassDeclaration, and we do that by
 * basically copying the original class and removing the trailingBreak in the
 * Indent component. With that, we are also to be able to test it properly,
 * as we aren't able to assert for the newline correctly.
 */
export function PythonBlock(props: BlockProps) {
  const childCount = computed(() => childrenArray(() => props.children).length);
  return (
    <group>
      {props.newline && <br />}
      {props.opener ?? "{"}
      <Indent softline={childCount.value === 0}>
        {props.children}
      </Indent>
      {props.closer ?? "}"}
    </group>
  );
}

export function ClassDeclaration(props: ClassDeclarationProps) {
  const fileContext = useContext(SourceFileContext);
  const name = getFormattedName(props.name!, "class");
  // For classes, the module name is derived from the file context
  const module = getModuleName(fileContext, undefined);
  // Propagate the name after the name policy was applied
  const updatedProps: ClassDeclarationProps = {
    ...props,
    name: name,
  };

  const sym = new PythonOutputSymbol(name, {
    refkeys: props.refkey ?? refkey(name!),
    flags:
      (props.flags ?? OutputSymbolFlags.None) |
      (OutputSymbolFlags.MemberContainer |
        OutputSymbolFlags.StaticMemberContainer),
    metadata: props.metadata,
    module: module,
  });

  const hasChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;
  const basesPart = props.bases && <>(<List children={props.bases} comma space />)</>;
  return (
    <Declaration {...updatedProps} name={updatedProps.name} symbol={sym}>
      class <Name />{basesPart}
      <PythonBlock opener=":" closer="" newline={false}>{hasChildren ? props.children : "pass"}</PythonBlock>
    </Declaration>
  );
}
