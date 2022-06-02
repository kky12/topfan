const AWS = require("aws-sdk");


const dynamo = new AWS.DynamoDB.DocumentClient();
//Table: marketItems

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /feeds/{id}":
        await dynamo
          .delete({
            TableName: "TopFansTable",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /feeds/{id}":
        body = await dynamo
          .get({
            TableName: "TopFansTable",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /feeds":
        body = await dynamo.scan({ TableName: "TopFansTable" }).promise();
        break;
      case "PUT /feeds":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "TopFansTable",
            Item: requestJSON
          })
          .promise();
        body = `Put feed ${requestJSON.pk}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
