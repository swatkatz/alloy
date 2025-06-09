import {
  Children,
  Declaration as CoreDeclaration,
  MemberScope,
  OutputSymbolFlags,
  Refkey,
} from "@alloy-js/core";
import { PythonElements, usePythonNamePolicy } from "../name-policy.js";
import { PythonOutputSymbol, PythonSymbolFlags } from "../symbols/index.js";
import { PrivateScopeContext } from "../context/private-scope.js";

export interface BaseDeclarationProps {
  /**
   * The base name of this declaration. May change depending on naming policy
   * and any conflicts.
   */
  name: string;

  /**
   * The refkey or array of refkeys for this declaration.
   */
  refkey?: Refkey | Refkey[];

  /**
   * Flags for the symbol created by this component.
   */
  flags?: OutputSymbolFlags;

  children?: Children;

  /**
   * Arbitrary metadata about this declaration.
   */
  metadata?: Record<string, unknown>;

  /**
   * Documentation for this declaration
   */
  doc?: Children;
}

export interface DeclarationProps extends Omit<BaseDeclarationProps, "name"> {
  /**
   * The name of this declaration.
   */
  name?: string;

  /**
   * The name policy kind to apply to the declaration.
   */
  nameKind?: PythonElements;

  /**
   * The symbol to use for this declaration.
   */
  symbol?: PythonOutputSymbol;
}

/**
 * Declare a symbol in the program. Declaring classes, interfaces, enums, etc.
 */
export function Declaration(props: DeclarationProps) {
  let sym: PythonOutputSymbol;

  if (props.symbol) {
    sym = props.symbol;
  } else {
    const namePolicy = usePythonNamePolicy();

    let pythonFlags: PythonSymbolFlags = PythonSymbolFlags.None;

    sym = new PythonOutputSymbol(namePolicy.getName(props.name!, props.nameKind!), {
      refkeys: props.refkey,
      flags: props.flags,
      pythonFlags,
      metadata: props.metadata,
    });
  }
  console.log("Registering symbol:", sym.name);
  console.log("Scope:", sym.scope);
  console.log("Current scope symbols:", Array.from(sym.scope.symbols.keys()));

  function withMemberScope(children: Children) {
    return <MemberScope owner={sym}>{children}</MemberScope>;
  }

  function withPrivateMemberScope(children: Children) {
    const context: PrivateScopeContext = {
      instanceMembers: sym.privateMemberScope!,
    };
    return (
      <PrivateScopeContext.Provider value={context}>
        {children}
      </PrivateScopeContext.Provider>
    );
  }

  let children: Children = () => props.children;

  if (sym.flags & OutputSymbolFlags.MemberContainer) {
    children = withMemberScope(children);
  }

  return <CoreDeclaration symbol={sym}>{props.children}</CoreDeclaration>;
}
