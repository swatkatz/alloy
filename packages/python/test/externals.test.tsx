import { Output, refkey, render } from "@alloy-js/core";
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
        {requestsLib["requests"].get}
        <hbr />
        {requestsLib["requests"].post}
        <hbr />
        {requestsLib["requests.models"].Request}
        <hbr />
        {requestsLib["requests.models"].Response}
      </py.SourceFile>
    </Output>,
  );

  expect(findFile(res, "test.py").contents).toBe(d`
    from requests import get
    from requests import post
    from requests.models import Request
    from requests.models import Response
    get
    post
    Request
    Response
  `);
});