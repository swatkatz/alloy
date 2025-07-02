import {
  AssignmentContext,
  Block,
  Children,
  computed,
  createAssignmentContext,
  emitSymbol,
  For,
  Match,
  MemberScope,
  moveTakenMembersTo,
  OutputSymbolFlags,
  Refkey,
  Switch,
  takeSymbols,
  useContext,
} from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { PythonOutputSymbol } from "../symbols/python-output-symbol.js";
import { PropertyName } from "./PropertyName.jsx";
import { SourceFileContext } from "./SourceFile.jsx";
import { Value } from "./Value.js";

export interface ObjectExpressionProps {
  children?: Children;
  jsValue?:
    | [string, unknown][]
    | Map<string, unknown>
    | Record<string, unknown>;
}

/**
 * Used to create Python object literals.
 *
 * @remarks
 * It can take a `jsValue` prop which can be an array of key-value pairs,
 * a Map, or an object. If `jsValue` is not provided, it will render an empty object `{}`.
 * The `children` prop can be used to add additional properties
 * to the object expression, which will be rendered after the properties from `jsValue`.
 * Each property can be defined using the `ObjectProperty` component.
 */
export function ObjectExpression(props: ObjectExpressionProps) {
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  const symbol = new PythonOutputSymbol("", {
    flags:
      OutputSymbolFlags.StaticMemberContainer | OutputSymbolFlags.Transient,
    module: module,
  });

  emitSymbol(symbol);

  const jsValueProperties = computed(() => {
    const jsValue = props.jsValue;
    let properties: [string, unknown][];
    if (Array.isArray(jsValue)) {
      properties = jsValue;
    } else if (jsValue instanceof Map) {
      properties = [...jsValue.entries()];
    } else if (jsValue !== undefined) {
      properties = Object.entries(jsValue);
    } else {
      properties = [];
    }
    return properties;
  });

  return (
    <Switch>
      <Match
        when={jsValueProperties.value.length === 0 && !("children" in props)}
      >
        {"{}"}
      </Match>
      <Match else>
        <group>
          <MemberScope owner={symbol}>
            <Block>
              <For each={jsValueProperties} comma softline enderPunctuation>
                {([name, value]) => (
                  <ObjectProperty name={name} jsValue={value} />
                )}
              </For>
              {props.children && (
                <>
                  {jsValueProperties.value.length > 0 && (
                    <>
                      ,<sbr />
                    </>
                  )}
                  {props.children}
                </>
              )}
            </Block>
          </MemberScope>
        </group>
      </Match>
    </Switch>
  );
}

export interface ObjectPropertyProps {
  name?: string;
  nameExpression?: Children;
  value?: Children;
  jsValue?: unknown;
  children?: Children;
  refkey?: Refkey | Refkey[];
}

/** Used to create properties in Python object literals.
 *
 * @remarks
 * It can take a `name` prop which is the name of the property, or a `nameExpression`
 * prop which is a JSX expression that evaluates to the name of the property.
 * The `value` prop can be used to set the value of the property, or a `jsValue`
 * prop which can be any valid JavaScript value. If neither `value` nor `jsValue`
 * is provided, it will render an empty value.
 */
export function ObjectProperty(props: ObjectPropertyProps) {
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  let name;
  if (props.name) {
    const namer = usePythonNamePolicy();
    name = <PropertyName name={namer.getName(props.name, "object-member")} />;
  } else if (props.nameExpression) {
    name = <>[{props.nameExpression}]</>;
  } else {
    throw new Error("ObjectProperty either a name or a nameExpression.");
  }

  let sym = undefined;
  if (props.refkey && props.name) {
    sym = new PythonOutputSymbol(props.name, {
      refkeys: props.refkey,
      flags: OutputSymbolFlags.StaticMember,
      module: module,
    });

    moveTakenMembersTo(sym);
  } else {
    // noop
    takeSymbols();
  }

  let value;
  if (props.value) {
    value = props.value;
  } else if (Object.hasOwn(props, "jsValue")) {
    // need the hasOwnProperty check because the value might be falsy.
    value = <Value jsValue={props.jsValue} />;
  } else if (props.children) {
    value = props.children;
  }

  const assignmentContext: AssignmentContext | undefined =
    sym ? createAssignmentContext(sym) : undefined;
  return (
    <>
      {name}:{" "}
      <AssignmentContext.Provider value={assignmentContext}>
        {value}
      </AssignmentContext.Provider>
    </>
  );
}

export interface ObjectSpreadPropertyProps {
  value?: Children;
  jsValue?: unknown;
  children?: Children;
}

/**
 * Used to create a spread property, which is used to
 * unpack dictionaries into function calls or object literals.
 *
 * @example
 * ```tsx
 * <ObjectSpreadProperty>abc</ObjectSpreadProperty>
 * ```
 * This will render as:
 * ```py
 * **abc
 * ```
 * 
 * @remarks
 * It can take a `value` prop which is a JSX expression that evaluates to the value of the spread property,
 * or a `jsValue` prop which can be any valid JavaScript value. If neither `value` nor `jsValue`
 * is provided, it will render an empty value.
 */
export function ObjectSpreadProperty(props: ObjectSpreadPropertyProps) {
  let value;
  if (props.value) {
    value = props.value;
  } else if (Object.hasOwn(props, "jsValue")) {
    // need the hasOwnProperty check because the value might be falsy.
    value = <Value jsValue={props.jsValue} />;
  } else if (props.children) {
    value = props.children;
  }

  return <>**{value}</>;
}
