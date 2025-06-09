import { computed, emitSymbol, Refkey } from "@alloy-js/core";
import { ref } from "../symbols/index.js";

export interface ReferenceProps {
  refkey: Refkey;
}

export function Reference(props: ReferenceProps) {
  const reference = ref(props.refkey);
  const symbolRef = computed(() => reference()[1]);

  emitSymbol(symbolRef);
  console.log("Reference refkey:", props.refkey);
  console.log("reference()[0]", reference()[0]);
  return <>{reference()[0]}</>;
}
