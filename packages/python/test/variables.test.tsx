import { refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";
import { d } from "@alloy-js/core/testing";

describe("Python Variable", () => {
  it("declares a python variable", () => {
    const res = toSourceText([
      <py.VariableDeclaration name="myVar" type="int" initializer={42} />,
    ]);
    const expected = d`
        my_var: int = 42

      `;
    expect(res).toBe(expected);
  });

  it("declares a python variable without value", () => {
    const res = toSourceText([
      <py.VariableDeclaration name="myVar" type="int" omitNone />,
    ]);
    const expected = d`
        my_var: int

      `;
    expect(res).toBe(expected);
  });

  it("declares a python variable without typeAnnotations", () => {
    const res = toSourceText([
      <py.VariableDeclaration name="myVar" initializer={42} />,
    ]);
    const expected = d`
        my_var = 42

      `;
    expect(res).toBe(expected);
  });

  it("declares a python variable as None when undefined", () => {
    const res = toSourceText([<py.VariableDeclaration name="myVar" />]);
    const expected = d`
        my_var = None

      `;
    expect(res).toBe(expected);
  });

  it("declares a python variable as None when null", () => {
    const expected = d`
        my_var = None

      `;
    const res = toSourceText([
      <py.VariableDeclaration
        name="myVar"
        initializer={<py.Value jsValue={null} />}
      />,
    ]);
    expect(res).toBe(expected);
  });

  it("declares a python variable with a python value", () => {
    const expected = d`
        name_id_pairs = {"John": 123, "Doe": 234}

      `;
    const res = toSourceText([
      <py.VariableDeclaration
        name="nameIdPairs"
        initializer={<py.Value jsValue={{ John: 123, Doe: 234 }} />}
      />,
    ]);
    expect(res).toBe(expected);
  });

  it("declares a python variable with omitNone", () => {
    const expected = d`
        omit_none_var: int

      `;
    const res = toSourceText([
      <py.VariableDeclaration name="omitNoneVar" type="int" omitNone={true} />,
    ]);
    expect(res).toBe(expected);
  });

  it("declares a call statement python variable", () => {
    const expected = d`
        call_stmt_var=12

      `;
    const res = toSourceText([
      <py.VariableDeclaration
        name="callStmtVar"
        initializer={12}
        callStatementVar={true}
      />,
    ]);
    expect(res).toBe(expected);
  });

  it("declares a call statement python variable without name", () => {
    const expected = d`
        12

      `;
    const res = toSourceText([
      <py.VariableDeclaration
        name=""
        initializer={12}
        callStatementVar={true}
      />,
    ]);
    expect(res).toBe(expected);
  });

  it("declares a python variable receiving other variable as value", () => {
    const expected = d`
        my_var = 42
        my_other_var = my_var

      `;
    const res = toSourceText([
      <py.StatementList>
        <py.VariableDeclaration name="my_var" initializer={42} />
        <py.VariableDeclaration
          name="my_other_var"
          initializer={refkey("my_var")}
        />
      </py.StatementList>,
    ]);
    expect(res).toBe(expected);
  });
});
