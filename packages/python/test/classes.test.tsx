import { List, memberRefkey, Output, refkey, render } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/components/index.js";
import { assertFileContents, toSourceText } from "./utils.jsx";

describe("Python Class", () => {
  it("renders a class with no body as 'pass'", () => {
    const result = toSourceText(<py.ClassDeclaration name="Foo" />);
    expect(result).toRenderTo(d`
      class Foo:
        pass


    `);
  });

  it("renders a class with a body", () => {
    const result = toSourceText(
      <py.ClassDeclaration name="Bar">print('hi')</py.ClassDeclaration>,
    );
    expect(result).toRenderTo(d`
      class Bar:
        print('hi')


    `);
  });

  it("renders a class with base classes", () => {
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          {[
            <py.ClassDeclaration name="Base1" />,
            <py.ClassDeclaration name="Base2" />,
            <py.ClassDeclaration name="Baz" bases={[refkey("Base1"), refkey("Base2")]} />,
          ]}
        </py.SourceFile>
      </Output>,
    );
    const expected = d`
      class Base1:
        pass

      class Base2:
        pass

      class Baz(Base1, Base2):
        pass

        
    `;
    expect(result).toRenderTo(expected);
  });

  it("renders a class with base classes and body", () => {
    const result = toSourceText(
      <py.ClassDeclaration name="Qux" bases={["Base"]}>
        print('hello')
      </py.ClassDeclaration>,
    );
    expect(result).toRenderTo(d`
      class Qux(Base):
        print('hello')


    `);
  });

  it("renders classes across modules with inheritance", () => {
    const result = render(
      <Output>
        <py.SourceFile path="mod1.py">
          <py.ClassDeclaration name="A" />
        </py.SourceFile>
        <py.SourceFile path="folder/mod2.py">
          <py.ClassDeclaration name="B" bases={[refkey("A")]} />
        </py.SourceFile>
        <py.SourceFile path="mod3.py">
          <py.ClassDeclaration name="C" bases={[refkey("B")]} />
        </py.SourceFile>
      </Output>,
    );
    const mod1Expected = d`
      class A:
        pass


    `;
    const mod2Expected = d`
      from mod1 import A

      class B(A):
        pass


    `;
    const mod3Expected = d`
      from folder.mod2 import B

      class C(B):
        pass


    `;
    assertFileContents(result, { "mod1.py": mod1Expected });
    assertFileContents(result, { "folder/mod2.py": mod2Expected });
    assertFileContents(result, { "mod3.py": mod3Expected });
  });

  it("renders a class with class variables like foo: str, and also bar: A where A is another class", () => {
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <py.ClassDeclaration name="A" />
          <py.ClassDeclaration name="B">
            <List hardline>
              <py.VariableDeclaration name="bar" type={refkey("A")} omitNone />
              <py.VariableDeclaration name="foo" type="str" omitNone />
            </List>
          </py.ClassDeclaration>
        </py.SourceFile>
      </Output>,
    );
    const expected = d`
      class A:
        pass

      class B:
        bar: A
        foo: str


    `;
    expect(result).toRenderTo(expected);
  });

  it("renders a class with class fields", () => {
    const result = toSourceText(
      <>
        <py.ClassDeclaration name="Base"></py.ClassDeclaration>
        <hbr />
        <hbr />
        <py.ClassDeclaration name="A">
          <py.StatementList>
            <py.ClassField name="just_name" />
            <py.ClassField name="name_and_type" type="number" />
            <py.ClassField name="name_type_and_value" type="number">
              12
            </py.ClassField>
            <py.ClassField name="class_based" type={refkey("Base")} nullish />
          </py.StatementList>
        </py.ClassDeclaration>
      </>,
    );
    const expected = d`
      class Base:
        pass


      class A:
        just_name
        name_and_type: number
        name_type_and_value: number = 12
        class_based: Base = None


    `;
    expect(result).toRenderTo(expected);
  });

  it("renders a class with class variables like foo: str, and another identical class", () => {
    const result = toSourceText(
      <>
        <py.ClassDeclaration name="A">
          <py.StatementList>
            <py.VariableDeclaration name="foo" type="str" omitNone />
          </py.StatementList>
        </py.ClassDeclaration>
        <br />
        <py.ClassDeclaration name="B">
          <py.StatementList>
            <py.VariableDeclaration name="foo" type="str" omitNone />
          </py.StatementList>
        </py.ClassDeclaration>
      </>,
    );
    const expected = d`
      class A:
        foo: str

      class B:
        foo: str


    `;
    expect(result).toRenderTo(expected);
  });

  it("correctly access members of its type", () => {
    const classRk = refkey();
    const classMemberRk = refkey();
    const v1Rk = refkey();

    const res = render(
      <Output>
        <py.SourceFile path="inst.py">
          <py.StatementList>
            <py.VariableDeclaration
              name="one"
              refkey={v1Rk}
              type={classRk}
              initializer={
                <py.MemberExpression>
                  <py.MemberExpression.Part refkey={classRk} />
                  <py.MemberExpression.Part args />
                </py.MemberExpression>
              }
            />
            <>{memberRefkey(v1Rk, classMemberRk)}</>
          </py.StatementList>
        </py.SourceFile>
        <py.SourceFile path="decl.py">
          <py.ClassDeclaration name="Bar" refkey={classRk}>
            <py.StatementList>
              <py.ClassField name="instanceProp" refkey={classMemberRk}>
                42
              </py.ClassField>
            </py.StatementList>
          </py.ClassDeclaration>
        </py.SourceFile>
      </Output>,
    );

    assertFileContents(res, {
      "inst.py": `
        from decl import Bar

        one: Bar = Bar()
        one.instanceProp
      `,
    });
  });

  it("renders a class with class fields and method", () => {
    const result = toSourceText(
      <>
        <py.ClassDeclaration name="MyClass" bases={["BaseClass"]}>
          <py.StatementList>
            <py.ClassField name="a" type="int" />
            <py.ClassField name="b" type="int" />
            <py.ClassMethod name="my_method" parameters={[{ name: "a", type: "int" }, { name: "b", type: "int" }]} returnType="int">
              return a + b
            </py.ClassMethod>
          </py.StatementList>
        </py.ClassDeclaration>
      </>
    );
    const expected = d`
      class MyClass(BaseClass):
        a: int
        b: int
        def my_method(self, a: int, b: int) -> int:
          return a + b



    `;
    expect(result).toRenderTo(expected);
  });
});
