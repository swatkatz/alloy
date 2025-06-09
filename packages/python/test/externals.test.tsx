import { Output, render } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { createModule } from "../src/index.js";
import { findFile } from "./utils.js";

it("uses import from external library", () => {
  const requestsLib = createModule({
    name: "requests",
    version: "1.0.0",
    descriptor: {
      "requests": {
        named: ["get", "post"],
      },
      "requests.models": {
        named: ["Response", "Request"],
      },
    },
  });

  const res = render(
    <Output externals={[requestsLib]}>
      <py.SourceFile path="test.py">
        <py.StatementList>
          <py.ObjectDeclaration
            type={requestsLib["requests.models"].Request}
            name="request"
          />
          <py.ObjectDeclaration
            type={requestsLib["requests.models"].Response}
            name="response"
          />
        </py.StatementList>
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    from requests.models import Request, Response

    request: Request = Request()
    response: Response = Response()
  `);
});
