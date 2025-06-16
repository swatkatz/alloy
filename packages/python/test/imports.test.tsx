import { describe, expect, it } from "vitest";
import { ImportStatement } from "../src/components/ImportStatement.jsx";
import { ImportRecords, PythonOutputSymbol } from "../src/symbols/index.js"
import * as py from "../src/components/index.js";
import { assertFileContents, createPythonModuleScope, toSourceText } from "./utils.jsx";
import {
  ImportedSymbol,
} from "../src/symbols/index.js";

describe("ImportStatement", () => {
  it("renders module import", () => {
    const result = toSourceText(
      <ImportStatement path="sys"  />
    );
    const expected = `import sys`;
    expect(result).toRenderTo(expected);
  });

  it("renders named imports", () => {
    const sqrtSymbol = new PythonOutputSymbol("sqrt", { binder: undefined, scope: undefined });
    const piSymbol = new PythonOutputSymbol("pi", { binder: undefined, scope: undefined });
    const symbols = new Set<ImportedSymbol>([
      new ImportedSymbol(sqrtSymbol), new ImportedSymbol(piSymbol),
    ]);
    const result = toSourceText(
      <ImportStatement
        path="math"
        symbols={symbols}
      />
    );
    const expected = `from math import pi, sqrt`;
    expect(result).toRenderTo(expected);
  });

  it("renders named imports with aliases", () => {
    const sqrtSymbol = new PythonOutputSymbol("sqrt", { binder: undefined, scope: undefined });
    const sqrtSymbolAlias = new PythonOutputSymbol("square_root", { binder: undefined, scope: undefined });
    const piSymbol = new PythonOutputSymbol("pi", { binder: undefined, scope: undefined });
    const symbols = new Set<ImportedSymbol>([
      new ImportedSymbol(sqrtSymbol, sqrtSymbolAlias), new ImportedSymbol(piSymbol),
    ]);
    const result = toSourceText(
      <ImportStatement
        path="math"
        symbols={symbols}
      />
    );

    const expected = `from math import pi, sqrt as square_root`;
    expect(result).toRenderTo(expected);
  });

  it("renders wildcard import", () => {
    const result = toSourceText(
      <ImportStatement
        path="os"
        wildcard={true}
      />
    );
    const expected = `from os import *`;
    expect(result).toRenderTo(expected);
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

    const result = toSourceText(
      <py.ImportStatements records={records} />
    );
    const expected = `
    from math import pi
    from math import sqrt
    from os import *
    from requests import get
    import sys`;
    expect(result).toRenderTo(expected);
  });
});
