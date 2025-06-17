import { Children, OutputSymbolFlags, refkey, Refkey, Show } from "@alloy-js/core";
import { enumModule } from "../builtins/python.js";
import { getFormattedName } from "../utils.js";
import { PythonOutputSymbol } from "../symbols/index.js";
import { Value } from "./Value.jsx";

export interface EnumMemberProps {
  /**
   * The name of the enum member.
   */
  name: string;

  /**
   * Refkey for the enum member symbol. If the refkey is not provided, a symbol
   * is not created and the member cannot be referenced by refkey.
   */
  refkey?: Refkey;

  /**
   * The value of the enum member.
   */
  value?: Children;

  /**
   * The JS value of the enum member.
   */
  jsValue?: string | number;

  /**
   * Functional mappings/list
   */
  functional?: boolean;

  /**
   * Will use auto() to generate the value if set to true.
   */
  auto?: boolean;

  /**
   * Documentation for the enum member.
   */
  doc?: Children;
}

/**
 * A Python enum member.
 */
export function EnumMember(props: EnumMemberProps) {
  const name = getFormattedName(props.name, "enum-member");
  const autoReference = props.auto === true ? enumModule["."].auto : undefined;
  const value = props.auto === true ? <>{autoReference}()</> : props.value;
  let sym: PythonOutputSymbol | undefined = undefined;
  if (props.refkey) {
    sym = new PythonOutputSymbol(name, {
      refkeys: props.refkey ?? refkey(name!),
      flags: OutputSymbolFlags.StaticMember,
    });
  }
  const actualName = sym ? sym.name : name;
  const valueCode =
    props.jsValue !== undefined ?
      <Value jsValue={props.jsValue} />
    : value;

  if (props.functional) {
    return (
      <>
        '{actualName}'<Show when={valueCode !== undefined}> : {valueCode}</Show>
      </>
    );
  }
  return (
    <>
      {actualName}
      <Show when={valueCode !== undefined}> = {valueCode}</Show>
    </>
  );
}
