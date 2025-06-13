import { Children, code } from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { Declaration } from "./Declaration.jsx";
import { InstanceParameters, InstanceParametersProps } from "./Parameters.jsx";
import { VariableDeclaration } from "./VariableDeclaration.jsx";

export interface ObjectInstantiationProps extends InstanceParametersProps {
  name: string; // e.g. "foo"
  type: Children;
}

export function ObjectInstantiation(props: ObjectInstantiationProps) {
  const name = usePythonNamePolicy().getName(props.name, "class");
  const params = (
    <InstanceParameters
      parameters={props.parameters}
      args={props.args}
      kwargs={props.kwargs}
    />
  );
  const value = code` ${props.type}(${params})`; // Include params in the value
  return (
    <Declaration {...props} name={name}>
      <VariableDeclaration {...props} value={value} />
    </Declaration>
  );
}