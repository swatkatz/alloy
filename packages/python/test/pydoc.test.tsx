import { Prose } from "@alloy-js/core";
import "@alloy-js/core/testing";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { PyDoc } from "../src/components/PyDoc.jsx";
import { PyDocExample } from "../src/components/PyDocExample.jsx";
import { PyDocComment } from "../src/components/PyDocComment.jsx";

describe("JSDoc", () => {
  it("formats properly", () => {
    const template = (
      <PyDocComment>
        Hello!
        <hbr />
        <hbr />
        This is another line
      </PyDocComment>
    );

    expect(template).toRenderTo(
      d`
      """
      Hello!
      
      This is another line
      """
    `,
      { printWidth: 40 },
    );
  });
});

describe("Prose", () => {
  it("formats properly", () => {
    const template = (
      <PyDoc>
        <Prose>
          This is an example of a long docstring that will be broken in
          lines. We will also render another paragraph after this one.
        </Prose>
        <Prose>
          This is another paragraph, and there's a line break before it.
        </Prose>
      </PyDoc>
    );

    expect(template).toRenderTo(
      d`
        """
        This is an example of a long docstring
        that will be broken in lines. We will
        also render another paragraph after this
        one.
        
        This is another paragraph, and there's a
        line break before it.
        """
      `,
      { printWidth: 40 },
    );
  });
});

describe("PyDocExample", () => {
  it("creates docstring with a code sample", () => {
    const template = (
      <PyDoc>
        <Prose>This is an example of a docstring with a code sample.</Prose>
        <PyDocExample>print("Hello world!")</PyDocExample>
      </PyDoc>
    );

    expect(template).toRenderTo(
      d`
      """
      This is an example of a docstring with a
      code sample.
      
      >> print("Hello world!")
      """
      `,
      { printWidth: 40 },
    );
  });

  it("creates docstring with more than one code sample", () => {
    const template = (
      <PyDoc>
        <Prose>This is an example of a docstring with a code sample.</Prose>
        <PyDocExample>print("Hello world!")</PyDocExample>
        <PyDocExample>print("Hello world again!")</PyDocExample>
      </PyDoc>
    );

    expect(template).toRenderTo(
      d`
      """
      This is an example of a docstring with a
      code sample.
      
      >> print("Hello world!")
      
      >> print("Hello world again!")
      """
      `,
      { printWidth: 40 },
    );
  });
  
  it("creates docstring with a multiline code sample", () => {
    const template = (
      <PyDoc>
        <Prose>This is an example of a docstring with a code sample.</Prose>
        <PyDocExample>
          print("Hello world!")<br />
          x = "Hello"<br />
          print(x)
        </PyDocExample>
      </PyDoc>
    );

    expect(template).toRenderTo(
      d`
      """
      This is an example of a docstring with a
      code sample.
      
      >> print("Hello world!")
      >> x = "Hello"
      >> print(x)
      """
      `,
      { printWidth: 40 },
    );
  });
});
