import { Output, render } from "@alloy-js/core";
import { describe, it } from "vitest";
import { ImportStatement } from "../src/components/ImportStatement.jsx";
import { ImportRecords, createPythonModuleScope, PythonOutputSymbol } from "../src/symbols/index.js"
import * as py from "../src/components/index.js";
import { assertFileContents } from "./utils.jsx";
import {
  ImportedSymbol,
} from "../src/symbols/index.js";

describe("ImportStatement", () => {
  it("renders module import", () => {
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <ImportStatement path="sys"  />
        </py.SourceFile>
      </Output>,
    );
    assertFileContents(result, { "test.py": `import sys` });
  });

  it("renders named imports", () => {
    const sqrtSymbol = new PythonOutputSymbol("sqrt", { binder: undefined, scope: undefined });
    const piSymbol = new PythonOutputSymbol("pi", { binder: undefined, scope: undefined });
    const symbols = new Set<ImportedSymbol>([
      new ImportedSymbol(sqrtSymbol), new ImportedSymbol(piSymbol),
    ]);
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <ImportStatement
            path="math"
            symbols={symbols}
          />
        </py.SourceFile>
      </Output>,
    );
    assertFileContents(result, {
      "test.py": `from math import pi, sqrt`,
    });
  });

  it("renders named imports with aliases", () => {
    const sqrtSymbol = new PythonOutputSymbol("sqrt", { binder: undefined, scope: undefined });
    const sqrtSymbolAlias = new PythonOutputSymbol("square_root", { binder: undefined, scope: undefined });
    const piSymbol = new PythonOutputSymbol("pi", { binder: undefined, scope: undefined });
    const symbols = new Set<ImportedSymbol>([
      new ImportedSymbol(sqrtSymbol, sqrtSymbolAlias), new ImportedSymbol(piSymbol),
    ]);
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <ImportStatement
            path="math"
            symbols={symbols}
          />
        </py.SourceFile>
      </Output>,
    );
    assertFileContents(result, {
      "test.py": `from math import pi, sqrt as square_root`,
    });
  });
  it("renders wildcard import", () => {
    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <ImportStatement
            path="os"
            wildcard={true}
          />
        </py.SourceFile>
      </Output>,
    );
    assertFileContents(result, {
      "test.py": `from os import *`,
    });
  });
});

describe("ImportStatements", () => {
  it("renders multiple import statements", () => {
    const pythonModuleScope = createPythonModuleScope("math", undefined);
    const sqrtSymbol = new PythonOutputSymbol("sqrt", { binder: undefined, scope: undefined });
    const piSymbol = new PythonOutputSymbol("pi", { binder: undefined, scope: undefined });
    const mathSymbols = new Set<ImportedSymbol>([new ImportedSymbol(sqrtSymbol), new ImportedSymbol(piSymbol)]);
    const osModuleScope = createPythonModuleScope("os", undefined);
    const sysModuleScope = createPythonModuleScope("sys", undefined);
    const requestsScope = createPythonModuleScope("requests", undefined);
    const getSymbol = new PythonOutputSymbol("get", { binder: undefined, scope: undefined });
    const requestsSymbols = new Set<ImportedSymbol>([new ImportedSymbol(getSymbol)]);
    const records = new ImportRecords([
      [pythonModuleScope, {symbols: mathSymbols}],
      [requestsScope, {symbols: requestsSymbols}],
      [osModuleScope, {symbols: new Set<ImportedSymbol>(), wildcard: true}],
      [sysModuleScope, {symbols: new Set<ImportedSymbol>()}],
    ]);

    const result = render(
      <Output>
        <py.SourceFile path="test.py">
          <py.ImportStatements records={records} />
        </py.SourceFile>
      </Output>,
    );
    assertFileContents(result, {
      // When rendering multiple import statements, multiple import statements from a single module
      // are kept as separate import statements.
      "test.py": `from math import pi\nfrom math import sqrt\nfrom os import *\nfrom requests import get\nimport sys`,
    });
  });
});
