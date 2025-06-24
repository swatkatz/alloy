import { Children, Name, code, memo } from "@alloy-js/core";
import {
  BaseDeclarationProps,
  Declaration,
  DeclarationProps,
} from "./Declaration.jsx";
import { Value } from "./Value.jsx";

export interface VariableDeclarationProps extends BaseDeclarationProps {
  value?: Children;
  type?: Children; // Optional, only for type annotation
  omitNone?: boolean; // Optional, to omit None assignment
  callStatementVar?: boolean; // Optional, to indicate if this is a call statement variable
}

export function VariableDeclaration(props: VariableDeclarationProps) {
  const updatedProps: DeclarationProps = {
    ...props,
    nameKind: "variable",
  };
  // Handle optional type annotation
  const typeAnnotation =
    props.type && !props.callStatementVar ? code`: ${props.type}` : "";
  // If we receive a symbol, resolve it to a name
  const value =
    typeof props.value === "object" ? memo(() => props.value) : props.value;
  const assignment = props.callStatementVar ? "=" : " = ";
  var rightSide;
  if (props.omitNone && props.value === undefined) {
    rightSide = "";
  } else if (value === null || value === undefined) {
    rightSide = <>{assignment}None</>;
  } else if (
    props.callStatementVar &&
    (props.name === undefined || props.name === "")
  ) {
    rightSide = (
      <>
        <Value jsValue={value} />
      </>
    );
  } else {
    rightSide = (
      <>
        {assignment}
        <Value jsValue={value} />
      </>
    );
  }
  return (
    <>
      <Declaration {...updatedProps}>
        {<Name />}
        {typeAnnotation}
        {rightSide}
      </Declaration>
    </>
  );
}
