import { Output } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { toSourceText } from "./utils.jsx";

describe("Python Method", () => {
  it("renders a method with no body as 'pass'", () => {
    const result = toSourceText(
      <py.Method name="foo" instanceMethod={true} />
    );
    expect(result).toRenderTo(d`
      def foo(self):
        pass
    `);
  });

  it("renders a method with no body as 'pass' with return type", () => {
    const result = toSourceText(
      <py.Method name="foo" instanceMethod={true} returnType="int"/>
    );
    expect(result).toRenderTo(d`
      def foo(self) -> int:
        pass
    `);
  });

  it("renders an instance method with a body", () => {
    const result = toSourceText(
      <py.Method name="bar" instanceMethod={true}>
        print('hi')
      </py.Method>
    );
    expect(result).toRenderTo(d`
      def bar(self):
        print('hi')
    `);
  });

  it("renders a class method with a body", () => {
    const result = toSourceText(
      <py.Method name="bar" classMethod={true}>
        print('hi')
      </py.Method>
    );
    expect(result).toRenderTo(d`
      def bar(cls):
        print('hi')
    `);
  });

  it("renders a function with parameters", () => {
    const result = toSourceText(
      <py.Method
        name="baz"
        parameters={[
          { name: "x", type: "int" },
          { name: "y", defaultValue: 0 },
        ]}
        args={true}
        kwargs={true}
      >
        print(x, y)
      </py.Method>
    );
    expect(result).toRenderTo(
      d`
        def baz(x: int, y = 0, *args, **kwargs):
          print(x, y)
      `,
    );
  });

  it("renders an init method with no body as 'pass'", () => {
    const result = toSourceText(
      <py.InitMethod
        parameters={[{ name: "x" }, { name: "y", defaultValue: 0 }]}
      />
    );
    expect(result).toRenderTo(d`
      def __init__(self, x, y = 0):
        pass
    `);
  });
});
