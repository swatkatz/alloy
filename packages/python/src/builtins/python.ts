import { SymbolCreator } from "@alloy-js/core";
import { createModule } from "../create-module.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type dummy = SymbolCreator;

export const enumModule = createModule({
  name: "enum",
  descriptor: {
    ".": ["auto", "Enum", "Flag", "IntEnum", "IntFlag", "StrEnum"],
  },
});

export const typingModule = createModule({
  name: "typing",
  descriptor: {
    ".": ["auto", "Any", "Callable", "Dict", "List", "Optional", "Tuple"],
  },
});
