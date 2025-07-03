import { computed, emitSymbol, Refkey } from "@alloy-js/core";
import { ref } from "../symbols/index.js";

export interface ReferenceProps {
  refkey: Refkey;

  /**
   * Whether this is a reference to a type.
   *
   * @remarks
   * This affect things like import where `type` keyword might be used.
   */
  type?: boolean;
}

/**
 * A Python reference to a symbol, such as a variable, function, or class.
 *
 * @remarks
 * This component is used to render references to symbols in Python code.
 * It takes a `refkey` prop which is the key of the symbol to reference.
 * The `type` prop indicates whether this is a reference to a type.
 */
export function Reference({ refkey, type }: ReferenceProps) {
  const reference = ref(refkey);
  const symbolRef = computed(() => reference()[1]);

  emitSymbol(symbolRef);
  return <>{reference()[0]}</>;
}
