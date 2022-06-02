
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const db_constant = require("../config/db-constants.json")
exports.insertCategoryInDB = async (item) => {
    const TableName = db_constant.category;
    const params = {
        TableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)"
    }
    return await dynamo.put(params).promise();
}

exports.updateCategoryInDB = async (item) => {
    const TableName = db_constant.category;
    const params = {
        TableName,
        Key: {
            pk: item.pk,
            sk: item.sk
        },
        ExpressionAttributeValues: {
            ":cn": item.category_name,
            ":ua": item.date,
            ":ac": item.active
        },
        UpdateExpression: "SET category_name = :cn, updated_at = :ua, active = :ac",
        ReturnValues: "ALL_NEW"
    };
    return await dynamo.update(params).promise();
}

exports.getUsersOfCategory = async (event) => {
    const category_id = event.pathParameters.id;
    if (event.queryStringParameters) {
        var last_evaluated_key_pk = event.queryStringParameters.last_evaluated_key_pk ? event.queryStringParameters.last_evaluated_key_pk : null
        var last_evaluated_key_sk = event.queryStringParameters.last_evaluated_key_sk ? event.queryStringParameters.last_evaluated_key_sk : null
    }
    const query = {
        TableName: db_constant.category,
        Limit: 12,
        KeyConditionExpression: '#pk = :category AND begins_with(#sk, :user)',
        ExpressionAttributeValues: {
            ':category': category_id,
            ':user': 'USER#',
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        }
    }
    if (last_evaluated_key_pk != null && last_evaluated_key_sk != null) {
        query['ExclusiveStartKey'] = {
            pk: last_evaluated_key_pk,
            sk: last_evaluated_key_sk
        }
    }
    let result = await dynamo.query(query).promise()
    return result
}
