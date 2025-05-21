import { Children } from "@alloy-js/core";


export function castOpenAPITypeToPython(type: Children) {
  switch (type) {
    case "string":
      return "str";
    case "number":
      return "int";
    default:
      return type;
  }
}