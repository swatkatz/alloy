import { refkey, render } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { findFile, toSourceText } from "./utils.jsx";
import { createModule } from "../src/create-module.js";

it("declaration of class instance with variables", () => {
  const result = toSourceText(
    <py.StatementList>
      <py.ClassDeclaration name="A" />
      <hbr />
      <py.CallStatement type={refkey("A")} name="obj" parameters={[
          { name: "name", value: <py.Value jsValue={"A name"} /> },
          { name: "number", value: <py.Value jsValue={42} /> },
          { value: <py.Value jsValue={true} /> },
        ]} />
    </py.StatementList>
  );
  const expected = d`
    class A:
      pass


    A(name="A name", number=42, True)
  `;
  expect(result).toRenderTo(expected);
});

it("correct resolving of external module", () => {
  const requestsLib = createModule({
    name: "requests",
    descriptor: {
      "models": ["Request"],
    },
  });
  const result = toSourceText(
    <py.StatementList>
      <py.CallStatement type={requestsLib["models"].Request} name="name" />
    </py.StatementList>,
    { externals: [requestsLib] },
  );
  const expected = d`
    from requests.models import Request
    Request()
  `;
  expect(result).toRenderTo(expected);
});