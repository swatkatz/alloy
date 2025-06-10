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
              { name: "x", value: <py.Value jsValue={1} /> },
              { name: "y", value: <py.Value jsValue={0} /> },
            ]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    class A:
      pass


    myModel: A = A(x=1, y=0)
  `);
});
