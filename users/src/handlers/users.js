const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const userServices = require('../services/user')
const cognito = require('../services/cognito');
const utils = require('../lib/utils')
const responseHandler = require('../config/response-handler.json')
const db_constant = require('../config/db-constants.json')



exports.handler = async (event) => {
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
      case "POST /users": // Create user api
        const inputData = JSON.parse(event.body);
        console.log(inputData, "<<<<<<<<<<<<<<<<<<")
        let object = utils.isObjectEmpty(inputData)
        body = { "message": responseHandler.MANDOTRY_FIELDS }
        if (!object) {
          await cognito.signUp(inputData)
          var result = await userServices.insertUserInDB(inputData)
          body = result
        }
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "message": body
        }
        break;
      case "POST /users/login": // Create user api
        const userCred = JSON.parse(event.body);
        var getUserToken = await cognito.signIn(userCred);
        let user = await userServices.getUserByEmail(userCred.email)
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "token": getUserToken,
          "is_profile_completed": (user && user.is_profile_completed) ? user.is_profile_completed : false
        }
        break;
      case "POST /users/verify": // Verify user OTP
        const verificationDetails = JSON.parse(event.body);
        await cognito.verify(verificationDetails);
        responseBody = {
          "status": status,
          "statusCode": statusCode
        }
        break;
      case "POST /users/resend-OTP":
        let resendOTP = await cognito.resendOTP(JSON.parse(event.body))
        responseBody = {
          "status": status,
          "statusCode": statusCode
        }
        break;
      case "PUT /users": // Update user
        const userData = JSON.parse(event.body);
        var update = await userServices.updateUserProfile(userData, event)
        body = update
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "message": body
        }
        break;
      case "PUT /users/category": //Update users category 
        const req = JSON.parse(event.body);
        await userServices.updateUserCategory(req, event)
        break;
      case "GET /home": //Get Home Screen 
        let homeData = await userServices.getHomeScreenData(event)
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "data": homeData
        }
        break;
      case "PUT /preferences": // get users post
        const prefData = JSON.parse(event.body);
        var results = await userServices.updateUserPreference(prefData)
        body = results
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "message": body
        }
        break;
      case "PUT /user/notification": // set notifications
        const notificationData = JSON.parse(event.body);
        var finalData = await userServices.updateUserNotificationsPreference(notificationData)
        body = finalData
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "message": body
        }
        break;
      case "POST /w9form": // w9 form
        const formData = JSON.parse(event.body);
        var finalFormData = await userServices.updateW9Form(formData,event)
        body = finalFormData
        break;
      case "GET /users": // get logged-in users 
        var value = await userServices.getLoggedInUsers(event)
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
    body = err.message;
    statusCode = body === 'User is not confirmed.' ? 401 : 400;
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
