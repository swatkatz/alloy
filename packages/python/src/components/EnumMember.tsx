import { Children, Show } from "@alloy-js/core";
import { enumModule } from "../builtins/python.js";
import { getFormattedName } from "../utils.js";

export interface EnumMemberProps {
  /**
   * The name of the enum member.
   */
  name: string;

  /**
   * The value of the enum member.
   */
  value?: Children;

  /**
   * Functional mappings/list
   */
  functional?: boolean;

  auto?: boolean;
}

/**
 * A Python enum member.
 */
export function EnumMember(props: EnumMemberProps) {
  const name = getFormattedName(props.name, "enum-member");
  const autoReference = props.auto === true ? enumModule["."].auto : undefined;
  const value = props.auto === true ? <>{autoReference}()</> : props.value;
  if (props.functional) {
    return (
      <>
        '{name}'<Show when={value !== undefined}> : {value}</Show>
      </>
    );
  }
  return (
    <>
      {name}
      <Show when={value !== undefined}> = {value}</Show>
    </>
  );
}
