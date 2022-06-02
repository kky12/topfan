
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });





//method to insert items in db
exports.insertItemsInDb = async (params) => {
dynamo.put(params, function(err, data) {
    if (err) {
     return err
    } else {
     return data
    }
  });
}

//method to update item in db
exports.updateItemsInDb = async (params) => {
    dynamo.update(params, function(err, updateresult) {
        if (err) {
         return err
        } else {
         return updateresult
        }
      });
    }


//methods to get single items
exports.getsingleItemsInDb = async (params) => {
    dynamo.get(params, function(err, getResult) {
        if (err) {
         return err
        } else {
         return getResult
        }
      });
    }

 //methods to get multiple items
 exports.getMultipleItemsInDb = async (params) => {
    dynamo.scan(params, function(err, getListResult) {
        if (err) {
         return err
        } else {
         return getListResult
        }
      });
    }

//methods to delete  items
exports.deleteItemsFromDb = async (params) => {
    dynamo.delete(params, function(err, deleteItem) {
        if (err) {
         return err
        } else {
         return deleteItem
        }
      });
    }

//methods to query the data
exports.queryItemsFromDb = async (params) => {
    dynamo.query(params, function(err, queryResult) {
        if (err) {
         return err
        } else {
         return queryResult
        }
      });
    }

//query when get query have more than 1mb data
exports.queryItemsFromDb = async (params) => {
    dynamo.query(params,function(err,result) {
         if(err) {
            callback(err);
        } else {   
            var items = items.concat(result.Items)
            if(result.LastEvaluatedKey) {

                params.ExclusiveStartKey = result.LastEvaluatedKey;
                queryExecute(callback);             
            } else {
                callback(err,items);
            }   
        }
    });
}
 
