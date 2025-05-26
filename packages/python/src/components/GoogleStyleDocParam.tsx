import { For, Prose, Show } from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { ParameterDescriptor } from "../parameter-descriptor.js";
import { Value } from "./Value.jsx";

export interface GoogleStyleDocParamsProps {
  parameters: ParameterDescriptor[] | string[];
}

/**
 * A component that creates a GoogleStyleDoc block for parameters.
 */
export function GoogleStyleDocParams(props: GoogleStyleDocParamsProps) {
  const parameters = normalizeParametersForDoc(props.parameters);
  return (
    <For each={parameters}>
      {(param) => (
        <GoogleStyleDocParam
          name={param.name}
          type={param.type}
          optional={param.optional}
        >
          {param.doc}
        </GoogleStyleDocParam>
      )}
    </For>
  );
}

function normalizeParametersForDoc(
  parameters: ParameterDescriptor[] | string[],
): ParameterDescriptor[] {
  if (parameters.some((p) => typeof p === "string")) {
    return [];
  }

  return parameters as ParameterDescriptor[];
}

export interface GoogleStyleDocParamProps {
  name: Children;
  type?: Children;
  children?: Children;
  optional?: boolean;
  defaultValue?: Children;
}

/**
 * Create a GoogleStyleDoc parameter.
 */
export function GoogleStyleDocParam(props: GoogleStyleDocParamProps) {
  return (
    <>
      {"    "}
      <GoogleStyleDocParamName
        name={props.name}
      />
      <GoogleStyleDocParamType type={props.type} optional={props.optional} />
      <GoogleStyleDocParamDescription children={props.children} defaultValue={props.defaultValue}/>
    </>
  );
}

interface GoogleStyleDocParamTypeProps {
  type?: Children;
  optional?: boolean;
}

function GoogleStyleDocParamType(props: GoogleStyleDocParamTypeProps) {
  return (
    <>
      <Show when={Boolean(props.type)}>
        {" ("}
        {props.type}
        <Show when={props.optional}>{", optional"}</Show>
        {")"}
      </Show>
    </>
  );
}

interface GoogleStyleDocParamNameProps{
  name: Children;
}

function GoogleStyleDocParamName(props: GoogleStyleDocParamNameProps) {
  return (
    <>
      {props.name}
    </>
  );
}

interface GoogleStyleDocParamDescriptionProps {
  children?: Children;
  defaultValue?: Children;
}

function GoogleStyleDocParamDescription(props: GoogleStyleDocParamDescriptionProps) {
  return (
    <Show when={Boolean(props.children)}>
      {": "}
      <align width={4}>
        <Prose>{props.children}</Prose>
        <Show when={Boolean(props.defaultValue)}> Defaults to <Value jsValue={props.defaultValue}></Value>.</Show>
      </align>
    </Show>
  );
}
