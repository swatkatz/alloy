import { Children, code, refkey } from "@alloy-js/core";
import * as ts from "@alloy-js/typescript";
import * as py from "@alloy-js/python";
import { useApi } from "../context/api.js";
import { RestApiOperation } from "../schema.js";
import { castOpenAPITypeToPython } from "../utils.js";

export interface ClientMethodProps {
  operation: RestApiOperation;
}

export function ClientMethod(props: ClientMethodProps) {
  const apiContext = useApi();
  const op = props.operation;

  // get the parameters based on the spec's endpoint and requestBody
  const parameters = [];

  const endpointParam = op.endpoint.match(/:(\w+)$/)?.[1];
  if (endpointParam) {
    parameters.push({
      name: endpointParam,
      type: "string",
      refkey: refkey(op, endpointParam),
    });
  }

  if (op.requestBody) {
    parameters.push({
      name: "body",
      type: refkey(apiContext.resolveReference(op.requestBody)),
      refkey: refkey(op, "requestBody"),
    });
  }

  // get the return type based on the spec's responseBody.
  let returnType: Children;
  if (op.responseBody === undefined) {
    returnType = null;
  } else {
    if ("ref" in op.responseBody && op.responseBody.ref) {
      const responseModel = apiContext.resolveReference(op.responseBody);
      const ref = refkey(responseModel?.name);
      returnType = <py.Reference refkey={ref} />;
    }
    else if ("type" in op.responseBody && op.responseBody.type) {
      returnType = code`${castOpenAPITypeToPython(op.responseBody.type)}`;
    }
    
    if (op.responseBody.array) {
      returnType = code`[${returnType}]`;
    }
  }

  // get the url endpoint, constructed from possible path parameters
  let endpoint: Children;
  if (endpointParam) {
    endpoint = (
      <>
        "{op.endpoint.slice(0, -endpointParam.length - 1)}" +{" "}
        {refkey(op, endpointParam)}
      </>
    );
  } else {
    endpoint = <>"{op.endpoint}"</>;
  }

  console.log("Parameters", parameters);
  return (
    <py.Method
      name={op.name}
      parameters={parameters}
      returnType={returnType}
      isInstanceMethod={true}
    ></py.Method>
  );
}
