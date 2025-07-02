import {
  code,
  List,
  Output,
  refkey,
  render,
  StatementList,
} from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import {
  ClassDeclaration,
  ClassField,
  FunctionDeclaration,
  ObjectExpression,
} from "../src/components/index.js";
import { MemberExpression } from "../src/components/MemberExpression.jsx";
import { VariableDeclaration } from "../src/components/VariableDeclaration.jsx";
import { ParameterDescriptor, SourceFile } from "../src/index.js";
import { assertFileContents, toSourceText } from "./utils.js";

it("renders basic member expression with dot notation", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="obj" />
        <MemberExpression.Part id="property" />
      </MemberExpression>,
    ),
  ).toBe(d`
    obj.property
  `);
});

it("renders basic member expression with index", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="arr" />
        <MemberExpression.Part index={0} />
        <MemberExpression.Part id="foo-bar" />
      </MemberExpression>,
    ),
  ).toBe(d`
    arr[0].foo-bar
  `);
});

it("renders basic member expression with children", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="arr" />
        <MemberExpression.Part>anything</MemberExpression.Part>
        <MemberExpression.Part id="foo-bar" />
      </MemberExpression>,
    ),
  ).toBe(d`
    arr.anything.foo-bar
  `);
});

it("renders basic member expression with an expression index", () => {
  const xRefkey = refkey();
  expect(
    toSourceText(
      <StatementList>
        <VariableDeclaration name="x" initializer={1} refkey={xRefkey} />
        <MemberExpression>
          <MemberExpression.Part id="arr" />
          <MemberExpression.Part mapAccess>{xRefkey} + 1</MemberExpression.Part>
          <MemberExpression.Part id="foo-bar" />
        </MemberExpression>
      </StatementList>,
    ),
  ).toBe(d`
    x = 1;
    arr[x + 1].foo-bar;
  `);
});

it("renders basic member expression with an expression index - 2", () => {
  expect(
    toSourceText(
      <StatementList>
        <MemberExpression>
          <MemberExpression.Part id="arr" />
          <MemberExpression.Part mapAccess>"foo" + 1</MemberExpression.Part>
          <MemberExpression.Part id="foo-bar" />
        </MemberExpression>
      </StatementList>,
    ),
  ).toBe(d`
    arr["foo" + 1].foo-bar;
  `);
});

it("throws an error for invalid identifiers with quotes", () => {
  expect(() =>
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="obj" />
        <MemberExpression.Part id={`property-"name"`} />
      </MemberExpression>,
    ),
  ).toThrowError(/Invalid identifier: property-"name"/);
});

it("supports multiple levels of nesting", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="a" />
        <MemberExpression.Part id="b" />
        <MemberExpression.Part id="c" />
        <MemberExpression.Part id="d" />
      </MemberExpression>,
    ),
  ).toBe(d`
    a.b.c.d
  `);
});

it("flattens nested member expressions", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="outer" />
        <MemberExpression>
          <MemberExpression.Part id="inner" />
          <MemberExpression.Part id="prop" />
        </MemberExpression>
        <MemberExpression.Part id="last" />
      </MemberExpression>,
    ),
  ).toBe(d`
    outer.inner.prop.last
  `);
});

it("handles a mix of dot and bracket notation", () => {
  expect(
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="obj" />
        <MemberExpression.Part id="normalProp" />
        <MemberExpression.Part mapAccess id="special-prop" />
        <MemberExpression.Part mapAccess id="123" />
      </MemberExpression>,
    ),
  ).toBe(d`
    obj.normalProp["special-prop"]["123"]
  `);
});

it("throws an error when providing conflicting part props", () => {
  expect(() =>
    toSourceText(
      <MemberExpression>
        <MemberExpression.Part id="obj" />
        <MemberExpression.Part id="property" args={[1, 2]} />
      </MemberExpression>,
    ),
  ).toThrowError(
    `Only one of args, id can be used for a MemberExpression part at a time`,
  );
});

it("takes children for the id part", () => {
  expect(
    toSourceText(
      <List>
        <MemberExpression>
          <MemberExpression.Part>child1</MemberExpression.Part>
          <MemberExpression.Part id="child2" mapAccess></MemberExpression.Part>
        </MemberExpression>
        <MemberExpression>
          <MemberExpression.Part>child1</MemberExpression.Part>
          <MemberExpression.Part id="child2" mapAccess></MemberExpression.Part>
          <MemberExpression.Part args />
          <MemberExpression.Part id="child3" mapAccess></MemberExpression.Part>
          <MemberExpression.Part args />
          <MemberExpression.Part mapAccess>"foo" + 1</MemberExpression.Part>
          <MemberExpression.Part args />
        </MemberExpression>
      </List>,
    ),
  ).toBe(d`
    child1["child2"]
    child1["child2"]()["child3"]()["foo" + 1]()
  `);
});

describe("with refkeys", () => {
    it("handles symbols correctly", () => {
      const rk1 = refkey();
      const rk2 = refkey();
      expect(
        toSourceText(
          <StatementList>
            <VariableDeclaration name="test1" refkey={rk1} initializer={1} />
            <VariableDeclaration name="test1" refkey={rk2} initializer={2} />
            <MemberExpression>
              <MemberExpression.Part refkey={rk1} />
              <MemberExpression.Part refkey={rk2} />
            </MemberExpression>
          </StatementList>,
        ),
      ).toBe(d`
        test1 = 1;
        test1_2_test = 2;
        test1.test1_2_test;
      `);
    });

  it("handles optional parameters correctly", () => {
    const fooRef = refkey();
    const modelRef = refkey();
    const parameters: ParameterDescriptor[] = [
      { name: "foo", optional: true, refkey: fooRef, type: modelRef },
    ];
    const messageRef = refkey();
    const template = (
      <List hardline>
        <ClassDeclaration name="Model" refkey={modelRef}>
          <ClassField name="bar" refkey={refkey()} type="str" />
        </ClassDeclaration>
        <FunctionDeclaration name="fooFunction" parameters={parameters}>
          <StatementList>
            <VariableDeclaration
              name="message"
              refkey={messageRef}
              initializer={
                <MemberExpression>
                  <MemberExpression.Part refkey={fooRef} />
                  <MemberExpression.Part id="bar" />
                </MemberExpression>
              }
            />
            <>print({messageRef})</>
          </StatementList>
        </FunctionDeclaration>
      </List>
    );

    expect(toSourceText(template)).toBe(d`
      class Model:
        bar: str = None

      def foo_function(foo: Model = None):
        message = foo.bar;
        print(message);

    `);
  });

  it("handles class member correctly", () => {
    const classRefkey = refkey();
    const interfaceRefkey = refkey();
    const interfaceMemberRefkey = refkey();
    const classMemberRefkey = refkey();
    const instanceRefkey = refkey();
    expect(
      toSourceText(
        <List hardline>
          <ClassDeclaration name="Bar" refkey={interfaceRefkey}>
            <ClassField
              name="prop1"
              refkey={interfaceMemberRefkey}
              type={"string"}
            />
          </ClassDeclaration>
          <ClassDeclaration name="Foo" refkey={classRefkey}>
            <ClassField
              name="test1"
              refkey={classMemberRefkey}
              type={interfaceRefkey}
            />
          </ClassDeclaration>
          <VariableDeclaration
            name="inst"
            refkey={instanceRefkey}
            initializer={code`${classRefkey}()`}
          />
          <MemberExpression>
            <MemberExpression.Part refkey={instanceRefkey} />
            <MemberExpression.Part refkey={classMemberRefkey} />
            <MemberExpression.Part refkey={interfaceMemberRefkey} />
          </MemberExpression>
        </List>,
      ),
    ).toBe(d`
       class Bar:
         prop1: string = None

       class Foo:
         test1: Bar = None

       inst = Foo()
       inst.test1.prop1
    `);
  });

  it("handles late resolved refkeys correctly", () => {
    const rk1 = refkey();
    const rk2 = refkey();
    expect(
      toSourceText(
        <List hardline>
          <MemberExpression>
            <MemberExpression.Part refkey={rk1} />
            <MemberExpression.Part refkey={rk2} />
          </MemberExpression>
          <VariableDeclaration name="test1" refkey={rk1} initializer={1} />
          <VariableDeclaration name="test1" refkey={rk2} initializer={2} />
        </List>,
      ),
    ).toBe(d`
      test1.test1_2_test
      test1 = 1
      test1_2_test = 2
    `);
  });

  it("creates a full reference to the first refkey", () => {
    const rk1 = refkey();
    const res = render(
      <Output>
        <SourceFile path="source.py">
          <VariableDeclaration name="importMe" refkey={rk1} />
        </SourceFile>
        <SourceFile path="index.py">
          <StatementList>
            <MemberExpression>
              <MemberExpression.Part refkey={rk1} />
              <MemberExpression.Part id="foo" />
            </MemberExpression>
            <MemberExpression>
              <MemberExpression.Part>{rk1}</MemberExpression.Part>
              <MemberExpression.Part id="foo" />
            </MemberExpression>
          </StatementList>
        </SourceFile>
      </Output>,
    );

    assertFileContents(res, {
      "index.py": d`
        from source import importMe

        importMe.foo;
        importMe.foo;
      `,
    });
  });
});

describe("with function calls", () => {
  it("handles simple function calls correctly", () => {
    expect(
      toSourceText(
        <MemberExpression>
          <MemberExpression.Part id="myFunction" />
          <MemberExpression.Part args={[1, 2]} />
        </MemberExpression>,
      ),
    ).toBe(d`
      myFunction(1, 2)
    `);
  });

  it("handles method calls correctly", () => {
    expect(
      toSourceText(
        <MemberExpression>
          <MemberExpression.Part id="method1" />
          <MemberExpression.Part args={[1, 2]} />
          <MemberExpression.Part args={[]} />
          <MemberExpression.Part id="method2" />
          <MemberExpression.Part args={[]} />
          <MemberExpression.Part id="prop" />
        </MemberExpression>,
      ),
    ).toBe(d`
      method1(1, 2)().method2().prop
    `);
  });

  it("handles function calls correctly", () => {
    expect(
      toSourceText(
        <MemberExpression>
          <MemberExpression.Part id="myFunction" />
          <MemberExpression.Part args={[1, 2]} />
          <MemberExpression.Part id="prop" />
        </MemberExpression>,
      ),
    ).toBe(d`
      myFunction(1, 2).prop
    `);
  });

  it("handles function calls correctly", () => {
    expect(
      toSourceText(
        <MemberExpression>
          <MemberExpression.Part id="myFunction" />
          <MemberExpression.Part args={[1, 2]} />
          <MemberExpression.Part id="prop" />
        </MemberExpression>,
      ),
    ).toBe(d`
      myFunction(1, 2).prop
    `);
  });
});

describe("formatting", () => {
  describe("simple chains", () => {
    it("just dots", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="four" />
            <MemberExpression.Part id="four" />
            <MemberExpression.Part id="two" />
            <MemberExpression.Part id="two" />
            <MemberExpression.Part id="two" />
            <MemberExpression.Part id="two" />
          </MemberExpression>,
          { printOptions: { printWidth: 12 } },
        ),
      ).toBe(d`
        four.four \\
          .two.two \\
          .two.two
      `);
    });

    it("bracket breaks", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="obj" />
            <MemberExpression.Part mapAccess id="property-name" />
            <MemberExpression.Part id="prop" />
          </MemberExpression>,
          { printOptions: { printWidth: 12 } },
        ),
      ).toBe(d`
        obj[
          "property-name"
        ].prop
      `);
    });
  });

  describe("call chains", () => {
    it("handles single calls", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part
              args={[<ObjectExpression jsValue={{ x: 1 }} />]}
            />
          </MemberExpression>,
          { printOptions: { printWidth: 12 } },
        ),
      ).toBe(d`
        z.object({
          x: 1,
        })
      `);
    });

    it("handles single calls with multiple parameters", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part
              args={[
                <ObjectExpression jsValue={{ x: 1 }} />,
                <ObjectExpression jsValue={{ y: 2 }} />,
              ]}
            />
          </MemberExpression>,
          { printOptions: { printWidth: 12 } },
        ),
      ).toBe(d`
        z.object(
          {
            x: 1,
          },
          {
            y: 2,
          }
        )
      `);
    });

    it("handles multiple calls", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part
              args={[<ObjectExpression jsValue={{ x: 1 }} />]}
            />
            <MemberExpression.Part id="partial" />
            <MemberExpression.Part args={[]} />
          </MemberExpression>,
          { printOptions: { printWidth: 12 } },
        ),
      ).toBe(d`
        z.object({
          x: 1,
        }).partial()
      `);
    });

    it("renders multiple calls on the same line when there are no breaks and they fit", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part args />
            <MemberExpression.Part id="partial" />
            <MemberExpression.Part args />
            <MemberExpression.Part id="optional" />
            <MemberExpression.Part args />
          </MemberExpression>,
        ),
      ).toBe(d`
        z.object().partial().optional()
      `);
    });

    it("handles multiple calls with id parts", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part id="z1" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part
              args={[<ObjectExpression jsValue={{ x: 1 }} />]}
            />
            <MemberExpression.Part id="foo" />
            <MemberExpression.Part id="partial" />
            <MemberExpression.Part args={[]} />
          </MemberExpression>,
        ),
      ).toBe(d`
        z.z1.object({
          x: 1,
        }).foo.partial()
      `);
    });

    it("handles the first part being a call", () => {
      expect(
        toSourceText(
          <MemberExpression>
            <MemberExpression.Part id="z" />
            <MemberExpression.Part args />
            <MemberExpression.Part id="z1" />
            <MemberExpression.Part id="object" />
            <MemberExpression.Part
              args={[<ObjectExpression jsValue={{ x: 1 }} />]}
            />
            <MemberExpression.Part id="foo" />
            <MemberExpression.Part id="partial" />
            <MemberExpression.Part args={[]} />
          </MemberExpression>,
        ),
      ).toBe(d`
        z().z1.object({
          x: 1,
        }).foo.partial()
      `);
    });
  });
});
