import {
  Block,
  BlockProps,
  Children,
  Indent,
  List,
  MemberDeclaration,
  Name,
  OutputSymbolFlags,
  Refkey,
  Scope,
  childrenArray,
  computed,
  refkey,
  splitProps,
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
import { TypeRefContext } from "./TypeRefContext.jsx";

export interface ClassDeclarationProps extends BaseDeclarationProps {
  bases?: Children[];
}

export function ClassDeclaration(props: ClassDeclarationProps) {
  const name = usePythonNamePolicy().getName(props.name!, "class");
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
    metadata: props.metadata,
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

export interface ClassMemberProps {
  name: string;
  refkey?: Refkey;
  children?: Children;
  doc?: Children;
  nullish?: boolean;
}

export function ClassMember(props: ClassMemberProps) {
  const namer = usePythonNamePolicy();
  const name = namer.getName(props.name, "class-member");

  let flags = OutputSymbolFlags.None | OutputSymbolFlags.InstanceMember;

  const memberScope = useMemberScope();
  let scope: PythonOutputScope =
    memberScope.instanceMembers! as PythonOutputScope;

  const sym = new PythonOutputSymbol(name, {
    scope,
    refkeys: props.refkey,
    flags,
  });

  return (
    <>
      <MemberDeclaration symbol={sym}>{props.children}</MemberDeclaration>
    </>
  );
}

export interface ClassFieldProps extends ClassMemberProps {
  type?: Children;
  optional?: boolean;
  children?: Children;
}

export function ClassField(props: ClassFieldProps) {
  const initializerSection =
    props.children ? <> = {props.children}</> : <> = {"None"}</>;
  const typeSection = props.type && (
    <>
      : <TypeRefContext>{props.type}</TypeRefContext>
    </>
  );
  const nullish = props.nullish ?? props.optional;

  return (
    <ClassMember {...props} nullish={nullish}>
      <PropertyName />
      {typeSection}
      {initializerSection}
    </ClassMember>
  );
}

export interface ClassMethodProps extends ClassMemberProps, CallSignatureProps {
  async?: boolean;
  instanceFunction?: boolean; // true if this is an instance method
  classFunction?: boolean; // true if this is a class method
  children?: Children;
}

export function ClassMethod(props: ClassMethodProps) {
  const callProps = getCallSignatureProps(props);
  const [_, rest] = splitProps(props, ["doc"]);
  const hasChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;

  return (
    <>
      <ClassMember {...rest}>
        {props.async && "async "}
        def <PropertyName />
        <Scope name={props.name} kind="function">
          <CallSignature {...callProps} />
          <Block opener=":" closer="">
            {hasChildren ? props.children : "pass"}
          </Block>
        </Scope>
      </ClassMember>
    </>
  );
}
