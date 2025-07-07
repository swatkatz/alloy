import {
  Block,
  Children,
  createSymbolSlot,
  For,
  Show,
  taggedComponent,
  useContext,
} from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { ParameterDescriptor } from "../parameter-descriptor.js";
import { PythonOutputSymbol, PythonSymbolFlags } from "../symbols/index.js";
import { SourceFileContext } from "./SourceFile.jsx";
import { TypeRefContext } from "./TypeRefContext.jsx";
import { Value } from "./Value.jsx";

const functionParametersTag = Symbol();
const functionBodyTag = Symbol();

export interface FunctionBodyProps {
  readonly children?: Children;
}

export interface FunctionParametersProps {
  readonly parameters?: ParameterDescriptor[] | string[];
  readonly args?: boolean;
  readonly kwargs?: boolean;
  readonly instanceFunction?: boolean;
  readonly classFunction?: boolean;
  readonly children?: Children;
}

/**
 * A Python function body, which can be used to define the body of a function.
 *
 * @example
 * ```tsx
 * <py.FunctionDeclaration name="foo">
 *   <py.FunctionDeclaration.Parameters>a, b</py.FunctionDeclaration.Parameters>
 *   <py.FunctionDeclaration.Body>return a + b</py.FunctionDeclaration.Body>
 * </py.FunctionDeclaration>
 * This will generate:
 * ```python
 * def foo(a, b):
 *   return a + b
 * ```
 */
export const FunctionBody = taggedComponent(
  functionBodyTag,
  function Body(props: FunctionBodyProps) {
    return (
      <Block opener="" closer="">
        {props.children}
      </Block>
    );
  },
);

/**
 * A Python function parameters declaration, which can be used to define the
 * parameters of a function.
 *
 * @example
 * ```tsx
 * <py.FunctionDeclaration name="foo">
 *   <py.FunctionDeclaration.Parameters>a, b</py.FunctionDeclaration.Parameters>
 *   <py.FunctionDeclaration.Body>return a + b</py.FunctionDeclaration.Body>
 * </py.FunctionDeclaration>
 * This will generate:
 * ```python
 * def foo(a, b):
 *   return a + b
 * ```
 *
 * @remarks
 *
 * Providing parameters can be accomplished in one of three ways:
 *
 * 1. As an array of {@link ParameterDescriptor}s.
 * 2. As raw content via the `parametersChildren`.
 * 3. As a child of this component via the {@link (FunctionParameters:namespace).parameter} components.
 */
export const FunctionParameters = taggedComponent(
  functionParametersTag,
  function Parameters(props: FunctionParametersProps) {
    if (props.children) {
      return props.children;
    }
    // Validate that only one of instanceFunction or classFunction is true
    if (props.instanceFunction && props.classFunction) {
      throw new Error(
        "Cannot be both an instance function and a class function",
      );
    }

    const sfContext = useContext(SourceFileContext);
    const module = sfContext?.module;
    const parameters = normalizeAndDeclareParameters(props.parameters ?? []);
    const additionalArgs =
      props.instanceFunction ? [{ name: "self" }]
      : props.classFunction ? [{ name: "cls" }]
      : [];
    return (
      <group>
        {additionalArgs.length > 0 ?
          <For each={additionalArgs} comma line>
            {(param) =>
              parameter({
                ...param,
                symbol: new PythonOutputSymbol(param.name, { module: module }),
              })
            }
          </For>
        : null}
        {additionalArgs.length > 0 && parameters.length > 0 ? ", " : null}
        <For each={parameters} comma line>
          {(param) => parameter(param)}
        </For>
        {props.args ?
          <group>
            <Show when={parameters.length > 0}>, </Show>
            *args
          </group>
        : null}
        {props.kwargs ?
          <group>
            <Show when={parameters.length > 0}>, </Show>
            **kwargs
          </group>
        : null}
      </group>
    );
  },
);

function parameter(param: DeclaredParameterDescriptor) {
  const SymbolSlot = createSymbolSlot();

  SymbolSlot.instantiateInto(param.symbol);

  return (
    <group>
      {param.symbol.name}
      <Show when={!!param.type}>
        :{" "}
        <SymbolSlot>
          <TypeRefContext>{param.type}</TypeRefContext>
        </SymbolSlot>
      </Show>
      <Show when={!!param.optional}>
        <Show when={!param.type}>=</Show>
        <Show when={!!param.type}> = </Show>
        <>
          {!!param.default ?
            <Value jsValue={param.default} />
          : "None"}
        </>
      </Show>
      <Show when={!param.optional && param.default !== undefined}>
        <Show when={!param.type}>=</Show>
        <Show when={!!param.type}> = </Show>
        <>
          <Value jsValue={param.default} />
        </>
      </Show>
    </group>
  );
}

interface DeclaredParameterDescriptor
  extends Omit<ParameterDescriptor, "name"> {
  symbol: PythonOutputSymbol;
}

function normalizeAndDeclareParameters(
  parameters: ParameterDescriptor[] | string[],
  flags: PythonSymbolFlags = PythonSymbolFlags.ParameterSymbol,
): DeclaredParameterDescriptor[] {
  const namePolicy = usePythonNamePolicy();
  const sfContext = useContext(SourceFileContext);
  const module = sfContext?.module;
  if (parameters.length === 0) {
    return [];
  }
  if (typeof parameters[0] === "string") {
    return (parameters as string[]).map((paramName) => {
      const name = namePolicy.getName(paramName, "parameter");

      const symbol = new PythonOutputSymbol(name, {
        pythonFlags: flags,
        module: module,
      });

      return { refkeys: symbol.refkeys, symbol };
    });
  } else {
    return (parameters as ParameterDescriptor[]).map((param) => {
      const nullishFlag =
        param.optional ? PythonSymbolFlags.Nullish : PythonSymbolFlags.None;

      const symbol = new PythonOutputSymbol(
        namePolicy.getName(param.name, "parameter"),
        {
          refkeys: param.refkey,
          pythonFlags: flags | nullishFlag,
          module: module,
        },
      );

      return {
        ...param,
        symbol,
      };
    });
  }
}
