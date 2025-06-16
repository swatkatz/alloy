import { Children, code } from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { CallStatementParameters, CallStatementParametersProps } from "./Parameters.jsx";

export interface CallStatementProps extends CallStatementParametersProps {
  name: string;
  type: Children;
}

export function CallStatement(props: CallStatementProps) {
  const name = usePythonNamePolicy().getName(props.name, "class");
  const params = (
    <CallStatementParameters
      parameters={props.parameters}
      args={props.args}
      kwargs={props.kwargs}
    />
  );
  const value = code` ${props.type}(${params})`; // Include params in the value
  return (
    <>
    {value}
    </>
  );
}