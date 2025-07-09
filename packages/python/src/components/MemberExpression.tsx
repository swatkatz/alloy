import {
  Children,
  childrenArray,
  code,
  computed,
  For,
  isComponentCreator,
  OutputSymbol,
  reactive,
  ref,
  Refkey,
  Show,
  takeSymbols,
  ToRefs,
  useBinder,
} from "@alloy-js/core";

export interface MemberExpressionProps {
  children: Children;
}

interface PartDescriptorWithId extends PartDescriptorBase {
  id: Children;
}

interface PartDescriptorWithKey extends PartDescriptorBase {
  key: Children;
}

interface PartDescriptorWithKeys extends PartDescriptorBase {
  keys: Children[];
}

interface PartDescriptorWithSlice extends PartDescriptorBase {
  slice: {
    start?: Children;
    stop?: Children; 
    step?: Children;
  };
}

interface PartDescriptorBase {
  accessStyle: "dot" | "bracket";
  args?: Children[];
  quoted: boolean;
}

type PartDescriptor = PartDescriptorWithId | PartDescriptorWithKey | PartDescriptorWithKeys | PartDescriptorWithSlice;

/**
 * Create a member expression from parts. Each part can provide one of
 * the following:
 *
 * * **id**: The identifier for the member expression part
 * * **refkey**: a refkey for a symbol whose name becomes the identifier
 * * **symbol**: a symbol whose name becomes the identifier part
 * * **args**: create a method call with the given args
 * * **children**: arbitrary contents for the identifier part.
 *
 * @example
 *
 * ```tsx
 * <MemberExpression>
 *   <MemberExpression.Part id="base" />
 *   <MemberExpression.Part refkey={rk} />
 *   <MemberExpression.Part symbol={sym} />
 *   <MemberExpression.Part args={["hello", "world"]} />
 *   <MemberExpression.Part>SomeValue</MemberExpression.Part>
 * </MemberExpression>
 * ```
 *
 * Assuming `rk` is a refkey to a symbol name "prop1", and `sym` is a symbol
 * with a name of "prop2", this will render:
 *
 * ```ts
 * base.prop1.prop2("hello", "world").SomeValue
 * ```
 */
export function MemberExpression(props: MemberExpressionProps): Children {
  const children = childrenArray(() => props.children);
  const parts = childrenToPartDescriptors(children);
  // any symbols emitted from the children won't be relevant to
  // parent scopes. TODO: emit the proper symbol if we know it?
  takeSymbols();

  if (parts.length === 0) {
    return <></>;
  }

  // construct a member expression from the parts. accessStyle determines
  // whether we use dot or bracket notation.

  return computed(() => {
    return formatChain(parts);
  });
}

/**
 * Build part descriptors from the children of a MemberExpression.
 */
function childrenToPartDescriptors(children: Children[]): PartDescriptor[] {
  const parts: PartDescriptor[] = [];
  for (const child of children) {
    if (!isComponentCreator(child, MemberExpression.Part)) {
      // we ignore non-parts
      continue;
    }

    parts.push(
      createPartDescriptorFromProps(child.props, child === children[0]),
    );
  }

  return parts;
}

const exclusiveParts: (keyof MemberExpressionPartProps)[] = [
  "args",
  "refkey",
  "symbol",
  "id",
  "key",
  "keys",
  "slice",
];
/**
 * Creates a reactive part descriptor from the given part props.
 *
 * @param partProps The props for the part.
 * @param first Whether this is the first part in the expression. Refkeys are
 * handled specially for the first part.
 */
function createPartDescriptorFromProps(
  partProps: MemberExpressionPartProps,
  first: boolean,
) {
  const foundProps = exclusiveParts.filter((key) => {
    return key in partProps;
  });

  if (foundProps.length > 1) {
    throw new Error(
      `Only one of ${foundProps.join(", ")} can be used for a MemberExpression part at a time`,
    );
  }

  const symbolSource = computed(() => {
    if (partProps.refkey) {
      return getSymbolForRefkey(partProps.refkey).value;
    } else if (partProps.symbol) {
      return partProps.symbol;
    } else {
      return undefined;
    }
  });

  const part: ToRefs<PartDescriptor> = {
    id: computed(() => {
      if (partProps.key !== undefined || partProps.keys !== undefined || partProps.slice !== undefined) {
        return undefined;
      } else if (first && partProps.refkey) {
        return partProps.refkey;
      } else if (partProps.id !== undefined) {
        if (!isValidIdentifier(partProps.id)) {
          throw new Error(`Invalid identifier: ${partProps.id}`);
        }
        return partProps.id;
      } else if (symbolSource.value) {
        return symbolSource.value.name;
      } else {
        return "<unresolved symbol>";
      }
    }),
    accessStyle: computed(() => {
      if (partProps.key !== undefined || partProps.keys !== undefined || partProps.slice !== undefined) {
        return "bracket"
      } else {
        return "dot";
      }
    }),
    key: computed(() => {
      if (partProps.key !== undefined) {
        return partProps.key;
      } else {
        return undefined;
      }
    }),
    keys: computed(() => {
      if (partProps.keys !== undefined) {
        return partProps.keys;
      } else {
        return [];
      }
    }),
    slice: computed(() => {
      if (partProps.slice !== undefined) {
        return {
          start: partProps.slice.start,
          stop: partProps.slice.stop,
          step: partProps.slice.step,
        };
      } else {
        return {};
      }
    }),
    quoted: computed(() => {
      if (typeof partProps.key === "string") {
        return true;
      }
      return false;
    }),
    args: ref<any>(partProps.args === true ? [] : partProps.args),
  };

  return reactive(part);
}

/**
 * Convert a refkey to a symbol ref using the current binder.
 */
function getSymbolForRefkey(refkey: Refkey) {
  const binder = useBinder();
  return binder!.getSymbolForRefkey(refkey);
}

/**
 * Format a chain of parts into a MemberExpression.
 */
function formatChain(parts: PartDescriptor[]): Children {
  return computed(() => {
    const expression: Children[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0) {
        if (!isIdPartDescriptor(part)) {
          throw new Error(
            "The first part of a MemberExpression must be an id or refkey",
          );
        }
        expression.push(part.id);
      } else {
        if (part.args !== undefined) {
          // For parts with only args (no name), append function call directly
          expression.push(formatCallExpr(part));
        } else if (part.accessStyle === "dot") {
          expression.push(formatDotAccess(part));
        } else {
          // bracket notation - don't include the dot
          expression.push(formatArrayAccess(part));
        }
      }
    }

    return expression;
  });
}

/**
 * Format a part of a member expression that is an array access.
 * This is used for parts like `foo[0]` or `foo["bar"]`.
 */
function formatArrayAccess(part: PartDescriptor) {
  return (
    <group>
      {""}[
      <indent>
        <sbr />
        { part.quoted && '"' }
        { getBaseValue(part) }
        { part.quoted && '"' }
      </indent>
      <sbr />]
    </group>
  );
}

/**
 * Format a part of a member expression that is a dot access.
 * This is used for parts like `foo.bar` or `foo.baz()`.
 */
function formatDotAccess(part: PartDescriptor) {
  return (
    <group>
      <indent>
        <ifBreak> \</ifBreak>
        <sbr />
        {"."}
        { getBaseValue(part) }
      </indent>
    </group>
  );
}

/**
 * Format a part of a member expression that is a function call.
 * This is used for parts like `foo.bar()` or `foo.baz(arg1, arg2)`.
 */
function formatCallExpr(part: PartDescriptor) {
  const args = computed(() => {
    return typeof part.args === "boolean" ? [] : (part.args ?? []);
  });

  return (
    <group>
      {""}(<Show when={args.value.length <= 1}>{args.value[0]}</Show>
      <Show when={args.value.length > 1}>
        <indent>
          <sbr />
          <For each={args} comma line>
            {(arg) => arg}
          </For>
        </indent>
        <sbr />
      </Show>
      )
    </group>
  );
}

export interface MemberExpressionPartProps {
  /**
   * The identifier for attribute access (obj.attr).
   * Use this for Python attribute references.
   */
  id?: string | number;

  /**
   * Single key for subscription access (obj[key] or obj[0]).
   * Use this for single subscription access.
   */
  key?: Children;

  /**
   * Multiple keys for tuple subscription access (obj[a, b] -> obj[(a, b)]).
   * Use this when you need tuple key access.
   */
  keys?: Children[];

  /**
   * Slice notation for subscription access (obj[start:stop:step]).
   * Use this for Python slice syntax.
   */
  slice?: {
    start?: Children;
    stop?: Children; 
    step?: Children;
  };

  /**
   * A refkey for a symbol whose name becomes the identifier.
   */
  refkey?: Refkey;

  /**
   * A symbol whose name becomes the identifier.
   */
  symbol?: OutputSymbol;

  /**
   * Arguments to construct a call expression.
   */
  args?: Children[] | boolean;
}
/**
 * A part of a member expression. Each part can provide one of the following
 * props:
 *
 * * **id**: The identifier for the member expression part
 * * **refkey**: A refkey for a symbol whose name becomes the identifier
 * * **symbol**: a symbol whose name becomes the identifier part
 * * **args**: create a method call with the given args
 */
MemberExpression.Part = function (props: MemberExpressionPartProps) {
  /**
   * This component does nothing except hold props which are retrieved by
   * the `MemberExpression` component.
   */
};

function isValidIdentifier(id: Children) {
  if (typeof id === "string" && id.includes('"')) {
    return false;
  }
  return true;
}

function isIdPartDescriptor(
  part: PartDescriptor,
): part is PartDescriptorWithId {
  return "id" in part && part.id !== undefined;
}

function isKeyPartDescriptor(
  part: PartDescriptor,
): part is PartDescriptorWithKey {
  return "key" in part && part.key !== undefined;
}

function isKeysPartDescriptor(
  part: PartDescriptor,
): part is PartDescriptorWithKeys {
  return "keys" in part && part.keys !== undefined && part.keys.length > 0;
}

function isSlicePartDescriptor(
  part: PartDescriptor,
): part is PartDescriptorWithSlice {
  return (
    "slice" in part &&
    part.slice !== undefined &&
    Object.keys(part.slice).length > 0
  );
}

function getNameForRefkey(refkey: Children): Children {
  const parsedValue = getSymbolForRefkey(refkey as Refkey).value;
  return parsedValue !== undefined ? parsedValue.name : refkey;
}

function getBaseValue(part: PartDescriptor): Children | undefined {
  if (isIdPartDescriptor(part)) {
    return part.id;
  }
  if (isKeyPartDescriptor(part)) {
    return getNameForRefkey(part.key as Refkey);
  }
  if (isKeysPartDescriptor(part)) {
    let parsedKeys = [];
    for (const key of part.keys) {
      parsedKeys.push(getNameForRefkey(key as Refkey));
    }
    return code`${parsedKeys.join(", ")}`;
  }
  if (isSlicePartDescriptor(part)) {
    let parts = [];
    if (part.slice.start !== undefined) {
      parts.push(getNameForRefkey(part.slice.start as Refkey));
      parts.push(":");
    }
    if (part.slice.stop !== undefined) {
      if (part.slice.start === undefined) {
        parts.push(":");
      }
      parts.push(getNameForRefkey(part.slice.stop as Refkey));
    }
    if (part.slice.step !== undefined) {
      if (part.slice.start === undefined && part.slice.stop === undefined) {
        parts.push(":");
        parts.push(":");
      }
      else {
        parts.push(":");
      }
      parts.push(getNameForRefkey(part.slice.step as Refkey));
    }
    return code`${parts.join("")}`;
  }
}