import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { toSourceText } from "./utils.jsx";

describe("FunctionParameters", () => {
  it("renders a single string parameter", () => {
    const params = ["x"];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x
    `);
  });
  it("renders multiple string parameters", () => {
    const params = ["x", "y", "z"];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x, y, z
    `);
  });
  it("renders multiple string parameters with args and kwargs", () => {
    const params = ["x", "y", "z"];
    const result = <py.FunctionParameters parameters={params} args kwargs />;
    expect(toSourceText(result)).toBe(d`
      x, y, z, *args, **kwargs
    `);
  });
  it("renders multiple string parameters with instanceFunction", () => {
    const params = ["x", "y", "z"];
    const result = <py.FunctionParameters parameters={params} instanceFunction />;
    expect(toSourceText(result)).toBe(d`
      self, x, y, z
    `);
  });
  it("renders multiple string parameters with classFunction", () => {
    const params = ["x", "y", "z"];
    const result = <py.FunctionParameters parameters={params} classFunction />;
    expect(toSourceText(result)).toBe(d`
      cls, x, y, z
    `);
  });
  it("renders a single ParameterDescriptor parameter", () => {
    const params = [{ name: "x", type: "int" }];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x: int
    `);
  });
  it("renders a single optional ParameterDescriptor parameter", () => {
    const params = [{ name: "x", optional: true }];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x=None
    `);
  });
  it("renders a single optional ParameterDescriptor parameter with type and default", () => {
    const params = [{ name: "x", type: "int", default: 10 }];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x: int = 10
    `);
  });
  it("renders a single optional ParameterDescriptor parameter with type, optional and default", () => {
    const params = [{ name: "x", type: "int", optional: true, default: 10 }];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x: int = 10
    `);
  });
  it("renders multiple ParameterDescriptor parameters", () => {
    const params = [
      { name: "x", type: "int", optional: true, default: 10 },
      { name: "y", type: "str", optional: true, default: "default" },
      { name: "z", type: "float", optional: true, default: 3.14 },
    ];
    const result = <py.FunctionParameters parameters={params} />;
    expect(toSourceText(result)).toBe(d`
      x: int = 10, y: str = "default", z: float = 3.14
    `);
  });

  it("renders multiple parameters", () => {
    const params = [
      { name: "x", type: "int" },
      { name: "y", type: "dict", default: <py.Value jsValue={{ John: 123, Doe: 234 }} /> },
    ];
    const result = <py.FunctionParameters parameters={params} />;
    expect(result).toRenderTo(`x: int, y: dict = {"John": 123, "Doe": 234}`);
  });
});
