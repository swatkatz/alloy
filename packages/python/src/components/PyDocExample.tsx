import { childrenArray, For } from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";

export interface PyDocExampleProps {
  children: Children;
}

/**
 * Create a PyDoc example, which is prepended by \>\>.
 */
export function PyDocExample(props: PyDocExampleProps) {
  let children = childrenArray(() => props.children);
  let lines: string[] = [];

  if (children.length === 1 && typeof children[0] === "string") {
    // Split, trim each line, and filter out empty lines
    lines = children[0]
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } else {
    // For non-string children, filter out empty/whitespace-only strings
    lines = children
      .map(child => (typeof child === "string" ? child : ""))
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  return (
    <>
      <For each={lines}>
        {(line) => (
          <>
            {">> "}{line}
          </>
        )}
      </For>
    </>
  );
}
