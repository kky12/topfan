
"use strict";

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}
exports.isEmpty = (value, name) => {
    value = exports.trimStr(value)
    console.log('valuevaluevalue', value)
    if (value.length === 0) {
        throw new Error('Missing required key in params: ' + name);
    }
}

exports.trimStr = (str) => {
    console.log('strstrstrstrstr', str)
    if (!str) return str;
    return str.replace(/^\s+|\s+$/g, '');
}
