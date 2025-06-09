import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import { GoogleStyleDocParam } from "../src/components/GoogleStyleDocParam.jsx";
import { PyDoc } from "../src/index.js";

it("name only", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam name="somebody" />
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
          """
              somebody
          """
        `,
  );
});

it("name and type", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam name="somebody" type="str" />
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
          """
              somebody (str)
          """
        `,
  );
});

it("name, type and description", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam name="somebody" type="str">
        Somebody's name.
      </GoogleStyleDocParam>
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
          """
              somebody (str): Somebody's name.
          """
        `,
  );
});

it("name, type, description, and optional", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam name="somebody" type="str" optional>
        Somebody's name.
      </GoogleStyleDocParam>
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
        """
            somebody (str, optional): Somebody's name.
        """
        `,
  );
});

it("name, type, description, and optional with default value", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam
        name="somebody"
        type="str"
        optional
        defaultValue="John Doe"
      >
        Somebody's name.
      </GoogleStyleDocParam>
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
            """
                somebody (str, optional): Somebody's name. Defaults to \"John Doe\".
            """
            `,
  );
});

it("name, type, description, and optional with default value with a very long description", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam
        name="somebody"
        type="str"
        optional
        defaultValue="John Doe"
      >
        Somebody's name. This can be any string representing a person, whether
        it's a first name, full name, nickname, or even a codename (e.g., "Agent
        X"). It's used primarily for display purposes, logging, or greeting
        messages and is not required to be unique or validated unless specified
        by the caller.
      </GoogleStyleDocParam>
      <GoogleStyleDocParam name="somebody2" type="str">
        Somebody's name. This can be any string representing a person, whether
        it's a first name, full name, nickname, or even a codename (e.g., "Agent
        X"). It's used primarily for display purposes, logging, or greeting
        messages and is not required to be unique or validated unless specified
        by the caller.
      </GoogleStyleDocParam>
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
          """
              somebody (str, optional): Somebody's name. This can be any string
              representing a person, whether it's a first name, full name, nickname, or
              even a codename (e.g., "Agent X"). It's used primarily for display purposes,
              logging, or greeting messages and is not required to be unique or validated
              unless specified by the caller. Defaults to \"John Doe\".
          
              somebody2 (str): Somebody's name. This can be any string representing a
              person, whether it's a first name, full name, nickname, or even a codename
              (e.g., "Agent X"). It's used primarily for display purposes, logging, or
              greeting messages and is not required to be unique or validated unless
              specified by the caller.
          """
          `,
    { printWidth: 80 },
  );
});

it("name, type, description, and optional with default value with a description containing a linebreak", () => {
  const template = (
    <PyDoc>
      <GoogleStyleDocParam
        name="somebody"
        type="str"
        optional
        defaultValue="John Doe"
      >
        Somebody's name. This is one line
        <hbr />
        This is another line.
      </GoogleStyleDocParam>
    </PyDoc>
  );

  expect(template).toRenderTo(
    d`
          """
              somebody (str, optional): Somebody's name. This is one line
              This is another line. Defaults to \"John Doe\".
          """
          `,
    { printWidth: 80 },
  );
});
