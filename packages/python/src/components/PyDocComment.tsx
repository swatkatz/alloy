import { Children } from "@alloy-js/core/jsx-runtime";

export interface PyDocCommentProps {
  children: Children;
}

/**
 * A PyDoc comment block. This is a low-level component that merely creates the
 * block. Consider using {@link PyDoc} if you want to create more complex
 * comments.
 */
export function PyDocComment(props: PyDocCommentProps) {
  return (
    <>
      """
      <align string="">
        <hbr />
        {props.children}
      </align>
      <hbr />
      """
    </>
  );
}
