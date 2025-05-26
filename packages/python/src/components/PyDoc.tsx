import { List, childrenArray } from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { PyDocComment } from "./PyDocComment.jsx";

export interface PyDocProps {
  children: Children;
}

/**
 * A PyDoc comment. The children of this component are joined with two hard
 * linebreaks. This is useful for creating PyDoc comments with multiple paragraphs.
 */
export function PyDoc(props: PyDocProps) {
  return (
    <PyDocComment>
      <List doubleHardline>
        {childrenArray(() => props.children)}
      </List>
    </PyDocComment>
  );
}
