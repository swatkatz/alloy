import { Children, Indent, Prose, Scope, Show, code } from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { Declaration } from "./Declaration.jsx";
import { Parameters, ParametersProps } from "./Parameters.jsx";
import { PyDoc } from "./PyDoc.jsx";
import { GoogleStyleDocParams } from "./GoogleStyleDocParam.jsx";

export interface MethodProps extends ParametersProps {
  name: string; // e.g. "__init__" or "foo"
  instanceMethod?: boolean; // true if this is an instance method
  classMethod?: boolean; // true if this is a class method
  children?: Children; // method body
  returnType?: Children; // return type annotation
  doc?: Children; // docstring
}

export function Method(props: MethodProps) {
  const name = usePythonNamePolicy().getName(props.name, "method");
  // Validate that only one of instanceMethod or classMethod is true
  if (props.instanceMethod && props.classMethod) {
    throw new Error(
      "Method cannot be both an instance method and a class method",
    );
  }
  //TODO: Validate that if either classMethod or instanceMethod is true, this is being called in the scope of a class
  const additionalArgs =
    props.instanceMethod ? [{ name: "self" }]
    : props.classMethod ? [{ name: "cls" }]
    : [];
  const paramPropsWithSelf = [...additionalArgs, ...(props.parameters ?? [])];
  const params = (
    <Parameters
      parameters={paramPropsWithSelf}
      args={props.args}
      kwargs={props.kwargs}
    />
  );
  const docParams = [...(props.parameters ?? [])];

  return (
    <Declaration {...props} name={name}>
      <group>
        def {name}({params})<Show when={props.returnType !== undefined}>{code` -> ${props.returnType}`}</Show>:
        <Show when={Boolean(props.doc)}>
          <Indent>
            <PyDoc>
              {props.doc && <Prose children={props.doc} />}
              <Show when={(props.parameters && props.parameters.length > 0)}>
                <Prose>Parameters:</Prose><hbr />
                <GoogleStyleDocParams parameters={docParams} />
              </Show>
            </PyDoc>
          </Indent>
        </Show>
        <Scope name={name} kind="method">
          <Indent>{props.children ?? "pass"}</Indent>
        </Scope>
      </group>
    </Declaration>
  );
}

export function InitMethod(
  props: Omit<MethodProps, "name" | "instanceMethod" | "classMethod">,
) {
  return (
    <Method
      {...props}
      name="__init__"
      instanceMethod={true}
      classMethod={false}
    />
  );
}
