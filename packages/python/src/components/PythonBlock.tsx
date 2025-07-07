import { Block, Children } from "@alloy-js/core";

export function PythonBlock(props: { children: Children; opener?: string }) {
  return (
    <Block 
      opener={props.opener ?? ""} 
      closer="" 
      newline={false}
    >
      {props.children}
    </Block>
  );
}