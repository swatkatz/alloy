import { memberRefkey, For, List, refkey, Refkey } from "@alloy-js/core";
import * as py from "@alloy-js/python";

export function Usage() {
  const classInstantiation = (
    <py.ClassInstantiation
      target={refkey("PetstoreClient")}
    />
  );
  return (
    <>
      <List>
        <py.VariableDeclaration name={"client"} type={"PetstoreClient"} initializer={classInstantiation} />
        {memberRefkey(refkey("PetstoreClient"), refkey("create_pet"))}
      </List>
    </>
  );
}