const AWS = require('aws-sdk');
const postService = require('../services/post')
const db_constant = require("../config/db-constants.json")

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
	let body;
	let statusCode = 200;
	var status = true
	const headers = {
		"Content-Type": "application/json"
	};
	var responseBody = {
		"status": status,
		"statusCode": statusCode
	}
	try {
		switch (event.routeKey) {
			case "GET /post":
				body = await dynamo.scan({ TableName: `${db_constant.post}` }).promise();
				responseBody = {
					"status": status,
					"statusCode": statusCode,
					"message": body
				}
				break;
			case "POST /post":
				body = JSON.parse(event.body);
				var result = await postService.insertPostInDB(body, event);
				body = result.body
				responseBody = {
					"status": status,
					"statusCode": statusCode
				}
				break;
			case "GET /users/post": // get users post
				const user_id = JSON.parse(event.body);
				var value = await postService.getUsersAllPost(user_id)
				body = value
				responseBody = {
				  "status": status,
				  "statusCode": statusCode,
				  "message": body
				}
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