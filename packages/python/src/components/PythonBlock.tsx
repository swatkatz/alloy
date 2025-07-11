import { BlockProps, Children, childrenArray, computed, Indent } from "@alloy-js/core";

export class PythonBlockProps {
  children?: Children;
  trailingBreak?: boolean;
}

export function PythonBlock(props: PythonBlockProps) {
  const childCount = computed(() => childrenArray(() => props.children).length);
  const trailingBreak = props.trailingBreak ?? true;
  return (
    <group>
      {":"}
      <Indent softline={childCount.value === 0} trailingBreak={trailingBreak}>
        {props.children}
      </Indent>
    </group>
  );
}

export function TopLevelPythonBlock(props: BlockProps) {
  const childrenArr = childrenArray(() => props.children);
  const lastChild = childrenArr[childrenArr.length - 1];
  const isLastChildClassLevel = typeof lastChild == 'function' &&
    'component' in lastChild &&
    lastChild.component &&
    typeof lastChild.component === 'function' &&
    lastChild.component.name === 'ClassLevelPythonBlock';
  // If the last child is a ClassLevelPythonBlock, we only add one trailing break because
  // the ClassLevelPythonBlock already adds a trailing break.
  const trailingBreaks = 
    isLastChildClassLevel
      ? <><hbr /></>
      : <><hbr /><hbr /></>;
  return (
    <>
      <PythonBlock>
        {props.children}
      </PythonBlock>
      {trailingBreaks}
    </>
  );
}

export function ClassLevelPythonBlock(props: BlockProps) {
  return (
    <>
      <PythonBlock trailingBreak={true}>
        {props.children}
      </PythonBlock>
      <hbr />
    </>
  );
}