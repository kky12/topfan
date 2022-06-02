
"use strict";
const db_constant = require("../config/db-constants.json")

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}


exports.generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: 'SET',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp
}

exports.checkAgeLimit = (dateOfBirth) => {
    const date18YrsAgo = new Date();
    date18YrsAgo.setFullYear(date18YrsAgo.getFullYear() - 13);
    return dateOfBirth <= date18YrsAgo;

}


exports.containsSpecialChars = (str) => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}
  

exports.isEmailValid = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      {
        return (false)
      }
       
        return (true)

}
   
exports.isObjectEmpty = (object) => {
const isEmpty = Object.values(object).every(x => (x === null || x === ''));
return isEmpty
}