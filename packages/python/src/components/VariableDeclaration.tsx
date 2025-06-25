import { Children, Declaration as CoreDeclaration, Name, code, memo, refkey, useContext } from "@alloy-js/core";
import {
  BaseDeclarationProps,
  DeclarationProps,
} from "./Declaration.jsx";
import { Value } from "./Value.jsx";
import { usePythonNamePolicy } from "../name-policy.js";
import { PythonOutputSymbol } from "../symbols/index.js";
import { SourceFileContext } from "./SourceFile.jsx";

export interface VariableDeclarationProps extends BaseDeclarationProps {
  value?: Children;
  type?: Children; // Optional, only for type annotation
  omitNone?: boolean; // Optional, to omit None assignment
  callStatementVar?: boolean; // Optional, to indicate if this is a call statement variable
}

export function VariableDeclaration(props: VariableDeclarationProps) {
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  const name = usePythonNamePolicy().getName(props.name, "variable");
  const sym = new PythonOutputSymbol(name, {
    refkeys: props.refkey ?? refkey(name!),
    metadata: props.metadata,
    module: module,
  });
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
      <CoreDeclaration symbol={sym}>
        {<Name />}
        {typeAnnotation}
        {rightSide}
      </CoreDeclaration>
    </>
  );
}
