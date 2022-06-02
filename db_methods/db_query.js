const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });

//create items query
exports.createItemsQuery = (tableName,fields,pk,sk,conditionValue) => {
   
    let exp = {tableName,
        Item: {}
    }
    Object.entries(fields).forEach(([key, item]) => {       
        exp.Item[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    if(pk && sk){
        exp.Item['pk'] = pk
        exp.Item['sk'] = sk
    }
    if(conditionValue){
        exp['ConditionExpression']= "attribute_not_exists($conditionValue)"
    }

    return exp
      
    
    
}


//update items query when key are pk and sk


exports.generateUpdateQuery = (tableName,keyValue,fields) => {
    let Values = {
        UpdateExpression: 'SET',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        Values.UpdateExpression += ` #${key} = :${key},`;
        Values.ExpressionAttributeNames[`#${key}`] = key;
        Values.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = Values.UpdateExpression.slice(0, -1);

    return  {
        tableName,
        Key: {
            pk: 'user#' + keyValue,
            sk: 'user#' + keyValue
        },

        ExpressionAttributeValues: Values.ExpressionAttributeValues,
        ExpressionAttributeNames: Values.ExpressionAttributeNames,
        UpdateExpression: Values.UpdateExpression,
        ReturnValues: "UPDATED_NEW"

    };
    
}


//get query for gsi 
exports.getQueryGSI = (tableName,indexName,fields) => {
    let exp = {
        UpdateExpression: '',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
return {
    TableName: tableName,
    IndexName: indexName,
    ExpressionAttributeNames: exp.ExpressionAttributeNames,
    ExpressionAttributeValues: exp.ExpressionAttributeValues
    }
}

//update items query with key
exports.updateQueryWithKey = (tableName,indexName,fields,keyFilter) => {
    let update = {
        UpdateExpression: '',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        update.UpdateExpression += ` #${key} = :${key},`;
        update.ExpressionAttributeNames[`#${key}`] = key;
        update.ExpressionAttributeValues[`:${key}`] = item
    })
return {
    TableName: tableName,
    Key:keyFilter,
    IndexName: indexName,
    ExpressionAttributeNames: update.ExpressionAttributeNames,
    ExpressionAttributeValues: update.ExpressionAttributeValues
    }
}

exports.getQueryBegainsWith=(user_id) =>{
return {
    TableName: tableName,
    KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
    ExpressionAttributeNames:{
      "#pk": "#",
      "#user_relation": 'user_relation'
    },
    ExpressionAttributeValues: {
      ":pk": `USER#${user_id}`,
      ":sk": "POST"
    }
  }
}