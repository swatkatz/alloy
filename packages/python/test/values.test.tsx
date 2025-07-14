import { describe, expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { toSourceText } from "./utils.jsx";
import { d } from "@alloy-js/core/testing";

describe("Value", () => {
  it("renders string value", () => {
    const expected = d`
        "Test"


      `;
    expect(toSourceText([<py.Value jsValue={"Test"} />])).toRenderTo(expected);
  });

  it("renders null/undefined object", () => {
    const expected = d`
        None


      `;
    expect(toSourceText([<py.Value jsValue={undefined} />])).toRenderTo(expected);
  });

  it("renders number", () => {
    const expected = d`
        123


      `;
    expect(toSourceText([<py.Value jsValue={123} />])).toRenderTo(expected);
  });

  it("renders boolean - True", () => {
    const expected = d`
        True


      `;
    expect(toSourceText([<py.Value jsValue={true} />])).toRenderTo(expected);
  });

  it("renders boolean - False", () => {
    const expected = d`
        False


      `;
    expect(toSourceText([<py.Value jsValue={false} />])).toRenderTo(expected);
  });

  it("renders array", () => {
    const expected = d`
        [1, 2, 3]


      `;
    expect(toSourceText([<py.Value jsValue={[1, 2, 3]} />])).toRenderTo(expected);
  });

  it("renders object", () => {
    const expected = d`
        {"a": 1, "b": 2}


      `;
    expect(toSourceText([<py.Value jsValue={{ a: 1, b: 2 }} />])).toRenderTo(expected);
  });

  it("renders more complex object", () => {
    const expected = d`
        {"a": "1", "b": 2, "c": True}


      `;
    expect(
      toSourceText([<py.Value jsValue={{ a: "1", b: 2, c: true }} />]),
    ).toRenderTo(expected);
  });

  it("renders empty object", () => {
    const expected = d`
        {}


      `;
    expect(toSourceText([<py.Value jsValue={{}} />])).toRenderTo(expected);
  });

  it("renders function", () => {
    const expected = d`
        Test


      `;
    function Test() {
      return <>Test</>;
    }

    expect(toSourceText([<py.Value jsValue={Test} />])).toRenderTo(expected);
  });

  it("renders nested object", () => {
    const expected = d`
        {"a": {"b": {"c": 1}}, "d": 2}


      `;
    expect(
      toSourceText([<py.Value jsValue={{ a: { b: { c: 1 } }, d: 2 }} />]),
    ).toRenderTo(expected);
  });
});
