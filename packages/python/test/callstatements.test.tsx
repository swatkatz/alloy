import { Output, refkey, render } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { findFile } from "./utils.js";

it("declaration of class instance with variables", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.ClassDeclaration name="A" />
          <hbr />
          <py.CallStatement type={refkey("A")} name="myModel" parameters={[
              { name: "name", value: <py.Value jsValue={"A name"} /> },
              { name: "number", value: <py.Value jsValue={42} /> },
              { value: <py.Value jsValue={true} /> },
            ]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    class A:
      pass


    A(name="A name", number=42, True)
  `);
});

it("function call with variables", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.MethodDeclaration name="run_func" />
          <hbr />
          <py.CallStatement type={refkey("run_func")} name="result" parameters={[
              { name: "name", value: <py.Value jsValue={"A name"} /> },
              { name: "number", value: <py.Value jsValue={42} /> },
              { value: <py.Value jsValue={true} /> },
            ]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    def run_func():
      pass


    run_func(name="A name", number=42, True)
  `);
});

it("function call with variables and assignment", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.MethodDeclaration
          name="run_func"
          returnType="str"
          parameters={[
            { name: "name", type: "str" },
            { name: "number", type: "int" },
            { name: "flag", type: "bool" },
          ]}
          />
          <hbr />
          <py.VariableDeclaration name="result" type={<py.Reference refkey={refkey("run_func")} />} value={
            <py.CallStatement type={refkey("run_func")} name="result" parameters={[
              { name: "name", value: <py.Value jsValue={"A name"} /> },
              { name: "number", value: <py.Value jsValue={42} /> },
              { value: <py.Value jsValue={true} /> },
            ]} />
          } />

        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  // Fix type once we handle types properly
  expect(findFile(res, "test.py").contents).toBe(d`
    def run_func(name: str, number: int, flag: bool) -> str:
      pass


    result: run_func = run_func(name="A name", number=42, True)
  `);
});