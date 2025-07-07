import {
  Children,
  Declaration as CoreDeclaration,
  Name,
  OutputSymbolFlags,
  createSymbolSlot,
  effect,
  memo,
  refkey,
  useContext,
} from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { PythonOutputSymbol, PythonSymbolFlags } from "../symbols/index.js";
import { BaseDeclarationProps } from "./Declaration.jsx";
import { SourceFileContext } from "./SourceFile.jsx";
import { TypeRefContext } from "./TypeRefContext.jsx";
import { Value } from "./Value.jsx";

export interface VariableDeclarationProps extends BaseDeclarationProps {
  /**
   * The initial value of the variable.
   */
  initializer?: Children;
  /**
   * The type of the variable. Used only for type annotation. Optional.
   */
  type?: Children;
  /**
   * Indicates if we should omit the None assignment. Optional.
   */
  omitNone?: boolean;
  /**
   * Indicates if this is a call statement variable. Optional.
   * This is used to handle cases where the variable is part of a call statement.
   */
  callStatementVar?: boolean;
}

/**
 * A variable declaration component for Python.
 *
 * @example
 * ```tsx
 * <VariableDeclaration
 *   name="myVar"
 *   type="int"
 *   initializer={42}  // Initial value
 * />
 * <VariableDeclaration
 *   name="myOtherVar"
 *   type="str"
 *   omitNone={true}
 * />
 * <VariableDeclaration
 *   name="myCallStmtVar"
 *   callStatementVar={true}
 *   initializer={12}
 * />
 * VariableDeclaration
 *   name=""
 *   callStatementVar={true}
 *   initializer={12}
 * />
 * ```
 * renders to
 * ```py
 * myVar: int = 42
 * myOtherVar: str
 * myCallStmtVar=12
 * 12
 * ```
 */
export function VariableDeclaration(props: VariableDeclarationProps) {
  const TypeSymbolSlot = createSymbolSlot();
  const ValueTypeSymbolSlot = createSymbolSlot();
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  const name = usePythonNamePolicy().getName(props.name, "variable");
  const sym = new PythonOutputSymbol(name, {
    refkeys: props.refkey ?? refkey(name!),
    module: module,
    pythonFlags: PythonSymbolFlags.None,
  });
  // Handle optional type annotation
  const type =
    props.type && !props.callStatementVar ?
      <TypeRefContext>
        : <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
      </TypeRefContext>
    : undefined;

  effect(() => {
    if (TypeSymbolSlot.ref.value) {
      const takenSymbols = TypeSymbolSlot.ref.value;
      for (const symbol of takenSymbols) {
        // If the symbol is a type, instantiate it
        symbol.instantiateTo(sym);
      }
    } else if (ValueTypeSymbolSlot.ref.value) {
      const takenSymbols = ValueTypeSymbolSlot.ref.value;
      for (const symbol of takenSymbols) {
        // ignore non-transient symbols (likely not the result of an
        // expression).
        if (symbol.flags & OutputSymbolFlags.Transient) {
          symbol.moveTo(sym);
        }
      }
    }
  });

  // If we receive a symbol, resolve it to a name
  const value =
    typeof props.initializer === "object" ?
      memo(() => props.initializer)
    : props.initializer;
  const assignmentOperator = props.callStatementVar ? "=" : " = ";
  const getRightSide = () => {
    // Early return for omitNone case
    if (props.omitNone && props.initializer === undefined) {
      return [false, ""];
    }

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return [true, <>None</>];
    }

    let renderRightSideOperator = true;
    // Call statement with no name
    if (
      props.callStatementVar &&
      (props.name === undefined || props.name === "")
    ) {
      renderRightSideOperator = false;
    }

    // Standard assignment
    return [
      renderRightSideOperator,
      <ValueTypeSymbolSlot>
        <Value jsValue={value ?? props.children} />
      </ValueTypeSymbolSlot>,
    ];
  };
  const [renderRightSideOperator, rightSide] = getRightSide();
  return (
    <>
      <CoreDeclaration symbol={sym}>
        {<Name />}
        {type}
        {renderRightSideOperator && assignmentOperator}
        {rightSide}
      </CoreDeclaration>
    </>
  );
}
