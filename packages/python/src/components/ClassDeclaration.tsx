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
 *   <ClassField name="a" type="int" />
 *   <ClassField name="b" type="str" />
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
    metadata: props.metadata,
    module: module,
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
  /**
   * The name of the class member.
   */
  name: string;
  /**
   * The refkey for this class member.
   */
  refkey?: Refkey;
  /**
   * Any children to render inside the class member.
   */
  children?: Children;
  /**
   * Documentation for this declaration
   */
  doc?: Children;
  /**
   * Whether this member is can be null or not.
   */
  nullish?: boolean;
}

/**
 * A Python class member, which can be a field or a method.
 * @remarks
 *
 * Not made to be used directly, but rather as a base for the components
 * {@link ClassField} and {@link ClassMethod}.
 */
export function ClassMember(props: ClassMemberProps) {
  const namer = usePythonNamePolicy();
  const name = namer.getName(props.name, "class-member");
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;

  let flags = OutputSymbolFlags.None | OutputSymbolFlags.InstanceMember;

  const memberScope = useMemberScope();
  let scope: PythonOutputScope =
    memberScope.instanceMembers! as PythonOutputScope;

  const sym = new PythonOutputSymbol(name, {
    scope,
    refkeys: props.refkey,
    flags,
    module: module,
  });

  return (
    <>
      <MemberDeclaration symbol={sym}>{props.children}</MemberDeclaration>
    </>
  );
}

export interface ClassFieldProps extends ClassMemberProps {
  /**
   * The type of the class field. Optional.
   */
  type?: Children;
  /**
   * The initial value of the class field. Optional.
   */
  initializer?: Children;
}

/**
 * A Python class field, which can have a type and an initializer.
 *
 * @example
 * ```tsx
 * <ClassField name="a" type="int" />
 * ```
 * renders to
 * ```py
 * a: int = None
 * ```
 *
 * @remarks
 *
 * If the `children` prop is provided, it will be used as the initializer. If not,
 * it defaults to `None`.
 */
export function ClassField(props: ClassFieldProps) {
  if (props.children && props.initializer) {
    throw new Error(
      `You can either provide 'children' or 'initializer', not both.`,
    );
  }
  let initializer: Children = props.initializer ?? undefined;
  if (!initializer && props.children) {
    initializer = <>{props.children}</>;
  }

  return (
    <ClassMember {...props} nullish={props.nullish}>
      <VariableDeclaration
        name={props.name}
        type={props.type}
        refkey={props.refkey}
        omitNone={!props.nullish}
        initializer={initializer}
      />
    </ClassMember>
  );
}

export interface ClassMethodProps extends ClassMemberProps, CallSignatureProps {
  async?: boolean;
  instanceFunction?: boolean; // true if this is an instance method (defaults to true)
  classFunction?: boolean; // true if this is a class method
  children?: Children;
}

/**
 * A Python class method.
 *
 * @example
 * ```tsx
 * <ClassMethod name="my_method" parameters={[{ name: "a", type: "int" }, { name: "b", type: "str" }]} returnType="int">
 *   return a + b
 * </ClassMethod>
 * ```
 * renders to
 * ```py
 * def my_method(self, a: int, b: str) -> int:
 *   return a + b
 * ```
 * @remarks
 * The `instanceFunction` prop indicates whether this is an instance method
 * (defaults to true). If `false`, it will omit `self` from being rendered.
 * The `classFunction` prop indicates whether this is a class method (defaults to
 * false). If `true`, it is a class method.
 * The `async` prop indicates whether this is an async method (defaults to false).
 * The `children` prop is the body of the method. If not provided, it defaults
 * to `pass`.
 */
export function ClassMethod(props: ClassMethodProps) {
  const callProps = getCallSignatureProps(props);
  const [_, rest] = splitProps(props, ["doc"]);
  const hasChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;
  // Defaults to true in case the prop is not provided
  callProps.instanceFunction = props.instanceFunction ?? true;

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
