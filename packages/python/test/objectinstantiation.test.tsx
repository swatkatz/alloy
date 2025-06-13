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
          <py.ObjectDeclaration type={refkey("A")} name="myModel" parameters={[
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


    myModel: A = A(name="A name", number=42, True)
  `);
});