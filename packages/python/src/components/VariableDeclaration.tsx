import {
  Children,
  Name,
  SourceFileContext,
  code,
  memo,
  refkey,
  useContext,
} from "@alloy-js/core";
import { PythonOutputSymbol } from "../symbols/index.js";
import { getFormattedName, getModuleName } from "../utils.js";
import { BaseDeclarationProps, Declaration } from "./Declaration.jsx";
import { Value } from "./Value.jsx";

export interface VariableDeclarationProps extends BaseDeclarationProps {
  value?: Children;
  type?: Children; // Optional, only for type annotation
  omitNone?: boolean; // Optional, to omit None assignment
  callStatementVar?: boolean; // Optional, to indicate if this is a call statement variable
}

export function VariableDeclaration(props: VariableDeclarationProps) {
  const fileContext = useContext(SourceFileContext);
  const name = getFormattedName(props.name, "variable");
  const module = getModuleName(fileContext, undefined);
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
    // If there's no value and omtitNone is true, so no assignment
    rightSide = "";
  } else if (value === null || value === undefined) {
    //  If value is null or undefined, assign None
    rightSide = <>{assignment}None</>;
  } else if (props.callStatementVar && (name === undefined || name === "")) {
    // If this is a call statement variable and no name is provided, just show the value
    // without assignment
    rightSide = (
      <>
        <Value jsValue={value} />
      </>
    );
  } else {
    // Otherwise, show the assignment with the value
    // This is useful for cases like `x = 42` or `x = someFunction()`
    // where `x` is explicitly declared and assigned a value.
    rightSide = (
      <>
        {assignment}
        <Value jsValue={value} />
      </>
    );
  }
  return (
    <>
      <Declaration symbol={sym}>
        {<Name />}
        {typeAnnotation}
        {rightSide}
      </Declaration>
    </>
  );
}
