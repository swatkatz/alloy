import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { toSourceText } from "./utils.jsx";

/**
 * toSourceText wraps the children in a SourceFile component
 * and renders it to a string.
 */
it("renders an empty source file", () => {
  const result = toSourceText([]);
  const expected = d`


  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of source file", () => {
  const result = toSourceText([
      <py.ClassDeclaration name="someClass">
        <py.StatementList>
          <py.FunctionDeclaration name="someMethod" returnType="str" />
          <py.VariableDeclaration
            name="someVar"
            type="int"
            initializer={<py.Value jsValue={42} />}
          />
        </py.StatementList>
      </py.ClassDeclaration>,
      <py.FunctionDeclaration name="someFunction" />,
      <py.ClassDeclaration name="someOtherClass" />
  ]);
  const expected = d`
    class SomeClass:
        def some_method() -> str:
            pass

        some_var: int = 42



    def some_function():
        pass



    class SomeOtherClass:
        pass



  `;
  expect(result).toRenderTo(expected);
});