import { Block, BlockProps, childrenArray, computed, Indent } from "@alloy-js/core";


export function ClassLevelPythonBlock(props: BlockProps) {
  return (
    <>
      <Block opener=":" closer="" newline={false}>
        {props.children}
      </Block>
      <hbr />
    </>
  );
}