
"use strict";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const db_constant = require('../config/db-constants.json');

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}

exports.isEmpty = (value, name) => {
    if (value == "") {
		throw new Error('Missing required key in params: '+ name);
	}
}

exports.isEmptyObject = (obj, name) => {
    if (Object.keys(obj).length === 0) {
        throw new Error(`${name} should not be blank`);
    }
}

exports.dateFun = () => {
    var today = new Date();
    return {
        "date": ('0' + today.getDate()).slice(-2)+''+('0' +(today.getMonth()+1)).slice(-2)+''+ today.getFullYear(),
        "pdate": ('0' + today.getDate()).slice(-2)+'-'+('0' +(today.getMonth()+1)).slice(-2)+'-'+ today.getFullYear(),
        "ms": today.getMilliseconds()
    }
}

/*exports.getUserInfo = async (user_id) => {
    let getInfo = {
        TableName: db_constant.post,
        Key: {
            pk: `user#${user_id}`,
            sk: `user#${user_id}`
        }
    }
    console.log('.....................', JSON.stringify(getInfo));
    let user_data = await dynamo
            .get(getInfo)
            .promise();
    return user_data;
}*/


exports.getQueryBegainsWith = (email) => {

    return {
        TableName: db_constant.user_table,
        Limit: email.Limit,
        KeyConditionExpression: '#pk = :email AND begins_with(#sk, :post)',
        ExpressionAttributeValues: {
            ':email': `USER#${email.user_id}`,
            ':post': 'POST#'
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        }
    }

}
