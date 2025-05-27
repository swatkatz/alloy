import { List } from "@alloy-js/core";
import "@alloy-js/core/testing";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { SingleLineCommentBlock } from "../src/components/SingleLineCommentBlock.jsx";

describe("PyComment", () => {
  it("formats properly a simple comment", () => {
    const template = (
      <>
        <SingleLineCommentBlock>This is a comment</SingleLineCommentBlock>
        <hbr />
        This is a not a comment
      </>
    );

    expect(template).toRenderTo(
      d`
      # This is a comment
      This is a not a comment
      `,
      { printWidth: 40 },
    );
  });

  it("should not add extra line breaks", () => {
    const template = (
      <>
        <List hardline>
          <SingleLineCommentBlock>
            This is the first line
            <hbr />
            <hbr />
            This is the second line
          </SingleLineCommentBlock>
        </List>
        <hbr />
        Hello
      </>
    );

    expect(template).toRenderTo(
      d`
       # This is the first line
       #
       # This is the second line
       Hello
       `,
      { printWidth: 40 },
    );
  });

  it("formats properly multiple children", () => {
    const template = (
      <>
        <SingleLineCommentBlock>
          This is the first line
          <hbr />
          <hbr />
          This is the second line
        </SingleLineCommentBlock>
        <hbr />
        This is outside the comment
      </>
    );

    expect(template).toRenderTo(
      d`
       # This is the first line
       #
       # This is the second line
       This is outside the comment
       `,
      { printWidth: 40 },
    );
  });

  it("It correctly do word wrapping", () => {
    const template = (
      <>
        <SingleLineCommentBlock>
          This is a very long line that should be broken into multiple lines. It
          should also be aligned properly. The line breaks in this paragraph
          should not be carried over into the PyDoc comment.
        </SingleLineCommentBlock>
        <hbr />
        <>This should not be part of the comment</>
      </>
    );

    expect(template).toRenderTo(
      d`
       # This is a very long line that should
       # be broken into multiple lines. It
       # should also be aligned properly. The
       # line breaks in this paragraph should
       # not be carried over into the PyDoc
       # comment.
       This should not be part of the comment
    `,
      { printWidth: 40 },
    );
  });
});
