import { describe, expect, it } from "vitest";
import { Block, List, render } from "@alloy-js/core";
import * as py from "../src/components/index.js";
import { toSourceText } from "./utils.jsx";
import { d } from "@alloy-js/core/testing";

describe("Top Level Python Block", () => {
  it("Renders two spaces after one class declaration", () => {
    const result = toSourceText(
      <>
      class A
      <py.TopLevelPythonBlock opener=":" closer="">
        <List>
          1
        </List>
      </py.TopLevelPythonBlock>
      </>
    );
    const expected = d`
    class A:
      1




    `;
    expect(result).toRenderTo(expected);
  });
  it("Renders two spaces after multiple class declarations", () => {
    const result = toSourceText(
      <>
      class A
      <py.TopLevelPythonBlock opener=":" closer="">
        <List>
          1
        </List>
      </py.TopLevelPythonBlock>
      class B
      <py.TopLevelPythonBlock opener=":" closer="">
        <List>
          2
        </List>
      </py.TopLevelPythonBlock>
      </>
    );
    const expected = d`
    class A:
      1


    class B:
      2




    `;
    expect(result).toRenderTo(expected);
  });
});

describe("Class Level Python Block", () => {
  it("Renders one space after method declaration", () => {
    const result = toSourceText(
      <>
      def a
      <py.ClassLevelPythonBlock opener=":" closer="">
        <List>
          1
        </List>
      </py.ClassLevelPythonBlock>
      def b
      <py.ClassLevelPythonBlock opener=":" closer="">
        <List>
          2
        </List>
      </py.ClassLevelPythonBlock>
      </>
    );
    const expected = d`
    def a:
      1

    def b:
      2



    `;
    expect(result).toRenderTo(expected);
  });
});

describe("Mixed Python Blocks", () => {
  it("Renders one and two spaces according to the element", () => {
    const result = toSourceText(
      <>
      class A
      <py.TopLevelPythonBlock opener=":" closer="">
        def a
        <py.ClassLevelPythonBlock opener=":" closer="">
          <List>
            1
          </List>
        </py.ClassLevelPythonBlock>
        def b
        <py.ClassLevelPythonBlock opener=":" closer="">
          <List>
            2
          </List>
        </py.ClassLevelPythonBlock>
      </py.TopLevelPythonBlock>
      class B
      <py.TopLevelPythonBlock opener=":" closer="">
        def a
        <py.ClassLevelPythonBlock opener=":" closer="">
          <List>
            1
          </List>
        </py.ClassLevelPythonBlock>
        def b
        <py.ClassLevelPythonBlock opener=":" closer="">
          <List>
            2
          </List>
        </py.ClassLevelPythonBlock>
      </py.TopLevelPythonBlock>
      </>
    );
    const expected = d`
    class A:
      def a:
        1

      def b:
        2




    class B:
      def a:
        1

      def b:
        2






    `;
    expect(result).toRenderTo(expected);
  });
});