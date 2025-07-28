import { memberRefkey, For, List, refkey, Refkey } from "@alloy-js/core";
import * as py from "@alloy-js/python";

export function Usage() {
  const vRkey = refkey()
  const classInstantiation = (
    <py.ClassInstantiation
      target={refkey("PetstoreClient")}
    />
  );
  return (
    <>
      <List>
        <py.VariableDeclaration name={"client"} type={"PetstoreClient"} initializer={classInstantiation} refkey={vRkey}/>
        {memberRefkey(vRkey, refkey("create_pet"))}
      </List>
    </>
  );
}