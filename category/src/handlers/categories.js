const AWS = require('aws-sdk');
const responseHandler = require('../config/response-handler.json')
const categoryService = require('../services/category')
const utils = require('../lib/utils')
const db_constant = require("../config/db-constants.json")
const url = require('url');


const dynamo = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");
let id = '';

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  let status = true
  let responseBody
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /category/{pk}/{sk}":
        await dynamo
          .delete({
            TableName: db_constant.category,
            Key: {
              pk: event.pathParameters.pk,
              sk: event.pathParameters.sk
            }
          })
          .promise();
        body = `Deleted category ${event.pathParameters.pk}`;
        break;
      case "GET /category/{pk}/{sk}":
        const Params = {
          TableName: db_constant.category,
          KeyConditionExpression: '#pk = :category AND begins_with(#sk, :name)',
          ExpressionAttributeValues: {
            ':category': 'CATEGORY' + event.pathParameters.pk,
            ':name': 'CATEGORY#' + event.parameters.sk,
          },
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
          }
        }
        let value = await dynamo.query(getParams).promise()
        body = value.Items
        break;
      case "GET /category":
        const getParams = {
          TableName: db_constant.category,
          KeyConditionExpression: '#pk = :category AND begins_with(#sk, :name)',
          ExpressionAttributeValues: {
            ':category': 'CATEGORY',
            ':name': 'CATEGORY#'
          },
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
          }
        }
        let result = await dynamo.query(getParams).promise()
        responseBody = result.Items
        break;
      case "POST /category":
        body = JSON.parse(event.body);
        var { category_name } = body;
        utils.isEmpty(category_name, 'category_name');
        id = crypto.randomBytes(16).toString("hex");
        var item = {
          "pk": `CATEGORY`,
          "sk": `CATEGORY#${id}`,
          "category_name": category_name,
          "created_at": new Date().getTime(),
          "updated_at": new Date().getTime(),
          "active": true
        }
        await categoryService.insertCategoryInDB(item);
        return utils.sendResponse(201,
          JSON.stringify(responseHandler.Category_created)
        )
        break;
      case "PUT /category/{pk}/{sk}":
        utils.isEmpty(category_name, 'category_name');
        body = JSON.parse(event.body);
        var { category_name, active } = body;
        var date = new Date()
        var itemObj = {
          category_name,
          active,
          date,
          pk: event.pathParameters.pk,
          sk: event.pathParameters.sk
        }
        await categoryService.updateCategoryInDB(itemObj);
        return utils.sendResponse(200,
          JSON.stringify(responseHandler.Category_updated)
        )
        break;
      case "DELETE /category/subcategory/{pk}/{sk}":
        await dynamo
          .delete({
            TableName: db_constant.category,
            Key: {
              pk: event.pathParameters.pk,
              sk: event.pathParameters.sk
            }
          })
          .promise();
        body = `Deleted subcategory ${event.pathParameters.pk}`;
        break;
      case "GET /category/subcategory/{pk}":
        const category_pkid = event.pathParameters.pk;
        console.log('category_pkidcategory_pkid', category_pkid)
        const Param = {
          TableName: db_constant.category,
          KeyConditionExpression: '#pk = :category AND begins_with(#sk, :name)',
          ExpressionAttributeValues: {
            ':category': category_pkid,
            ':name': 'SUBCATEGORY'
          },
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
          }
        }
        let results = await dynamo.query(Param).promise()
        responseBody = results.Items
        break;
      case "POST /category/subcategory":
        const inputData = JSON.parse(event.body);
        var { name, category_id } = inputData;
        id = crypto.randomBytes(16).toString("hex");
        body = JSON.parse(event.body);
        var item = {
          "pk": category_id,
          "sk": `SUBCATEGORY#${id}`,
          "category_name": name,
          "created_at": new Date().getTime(),
          "updated_at": new Date().getTime(),
          "active": true
        }
        await categoryService.insertCategoryInDB(item);
        statusCode = 201
        responseBody = {
          message: responseHandler.Category_created
        }
        break;
      case "GET /category/users/{id}":
        responseBody = await categoryService.getUsersOfCategory(event)
        break;
      case "PUT /category/subcategory/{pk}/{sk}":
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
    status = false
    responseBody = {
      "status": status,
      "statusCode": statusCode,
      "message": body
    }
  } finally {
    responseBody = JSON.stringify(responseBody);
  }

  return {
    statusCode: statusCode,
    headers,
    body: responseBody
  };
}