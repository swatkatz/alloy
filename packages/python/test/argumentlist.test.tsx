import { Output, refkey, render } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { createModule } from "../src/index.js";
import { findFile } from "./utils.js";

it("Simple unnamed argument list", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.ArgumentList args={["arg1", "arg2"]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    (arg1, arg2)
  `);
});

it("Empty argument list", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.ArgumentList args={[]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    ()
  `);
});

it("Class instance argument list", () => {
  const res = render(
    <Output>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.ArgumentList args={[
            <py.VariableDeclaration name="myVar" value={<py.Value jsValue={1} />} instanceVar={true} />,
            <py.VariableDeclaration name="myOtherVar" value={<py.Value jsValue={true} />} instanceVar={true} />,
            <py.Value jsValue={"test"} />
            ]} />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    (myVar=1, myOtherVar=True, "test")
  `);
});


