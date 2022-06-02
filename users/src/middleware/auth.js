const jwt_decode = require('jwt-decode')
exports.getUsernameFromJWTToken = async (token) => {
    var payload = jwt_decode(token);
    return payload.username
}