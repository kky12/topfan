
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const db_constant = require("../config/db-constants.json")
const utils = require('../lib/utils')
const responseHandler = require('../config/response-handler.json')
const auth = require('../middleware/auth')

//const { isEmpty } = require("../../../post/src/lib/utils");

exports.insertUserInDB = async (body) => {
    var result
    const { first_name, email, last_name, birth_date, password, confirm_password } = body;
    var f_name = first_name.trim()
    var l_name = last_name.trim()
    var dob = birth_date.trim()
       
    if(email){
       let emailValue= utils.isEmailValid(email)
       console.log(emailValue,"emailValueemailValue")
       if(emailValue){
        return {
            "message": responseHandler.MANDOTRY_FIELDS
        }
       }
    }
    if (f_name == "") {
        return {
            "message": responseHandler.FNAME_VALIDATION
        }
    }
    if (l_name == "") {
        return {
            "message": responseHandler.LNAME_VALIDATION
        }
    }
    if (dob == "") {
        return {
            "message": responseHandler.DATE_VALIDATION
        }
    }
    let dobVerification = await utils.checkAgeLimit(new Date(dob))
    if (dobVerification == false) {
        return {
            "message": responseHandler.AGE_LIMIT
        }
    }
    const TableName = db_constant.user_table;
    var params = {
        TableName,
        Item: {
            first_name: first_name,
            last_name: last_name,
            email: email,
            birth_date: birth_date,
            pk: 'USER#' + email,
            sk: 'USER#' + email,
            category: [],
            sub_category: [],
            profile_image_url: "",
            user_name: "",
            bio: "",
            general_location: "",
            gender: "",
            referred_email: "",
            content_type: [],
            active: false,
            verified: false,
            type: db_constant.USER,
            created_date: new Date().getTime(),
            gsi1sk: "@username",
            modified_date: '',
            is_profile_completed: false,
            phone_number: "",
            website_url: "",
            shipping_address: "",
            banner_image_url: ""

        },
        ConditionExpression: "attribute_not_exists(email)"
    }
    await dynamo.put(params).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.USER_CREATED)
    )
}

exports.getUserByEmail = async (email) => {
    const getParams = {
        TableName: db_constant.user_table,
        KeyConditionExpression: '#pk = :email AND begins_with(#sk, :user)',
        ExpressionAttributeValues: {
            ':email': `USER#${email}`,
            ':user': 'USER#'
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        }
    }
    let result = await dynamo.query(getParams).promise()
    return result.Items ? result.Items[0] : null
}

exports.updateUserProfile = async (inputData, event) => {console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
    let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
    const { bio, profile_image_url, user_name, genral_location, gender, referred_email, category } = inputData;
    const TableName = db_constant.user_table;
    console.log("P11111111111111111111111111111111111111111111111111111PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
    if (inputData.bio) {
        if (bio.length > 100) {
            return utils.sendResponse(500,
                JSON.stringify(responseHandler.LIMIT_EXCEED))

        }
    }
    if (inputData.gender) {
        if (!db_constant.Gender.includes(gender)) {
            return utils.sendResponse(400,
                JSON.stringify(responseHandler.GENDER))

        }
    }
    if (inputData.category) {
        //updating category from another method. 
        delete inputData.category
    }
    if(inputData.user_name){
        let resultname=utils.containsSpecialChars(inputData.user_name)
        if(resultname){
            return utils.sendResponse(400,
                JSON.stringify(responseHandler.USER_NAME))
        }
    }
    inputData.is_profile_completed = true
    var updateInput = utils.generateUpdateQuery(inputData)
    //console.log(updateInput, "updateInputupdateInputupdateInputupdateInputupdateInput")
    const params = {
        TableName,
        Key: {
            pk: 'USER#' + username,
            sk: 'USER#' + username
        },

        ExpressionAttributeValues: updateInput.ExpressionAttributeValues,
        ExpressionAttributeNames: updateInput.ExpressionAttributeNames,
        UpdateExpression: updateInput.UpdateExpression,
        ReturnValues: "UPDATED_NEW"
    };
    let result = await dynamo.update(params).promise();
    console.log(result,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}

exports.getHomeScreenData = async (event) => {
    //This method will change after admin integration
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
        },
        Limit: 5
    }
    let result = await dynamo.query(getParams).promise()
    let categories = result.Items
    let final_response = []
    for (let cat of categories) {
        let user_result = await getTopUsersOfCategory(cat)
        if (user_result.length > 0) {
            let res = {
                pk: cat.pk,
                sk: cat.sk,
                category_name: cat.category_name,
                users: user_result
            }
            final_response.push(res)
        }
    }
    return final_response
}

async function getTopUsersOfCategory(cat) {
    //This method will change after admin integration
    const getParams = {
        TableName: db_constant.category,
        KeyConditionExpression: '#pk = :category AND begins_with(#sk, :name)',
        ExpressionAttributeValues: {
            ':category': cat.sk,
            ':name': `USER#`
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        },
        Limit: 8
    }
    let result = await dynamo.query(getParams).promise()
    return result.Items
}

exports.updateUserCategory = async (inputData, event) => {
    const TableName = db_constant.user_table;
    const { category, sub_category } = inputData;
    let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
    var query = {
        TableName,
        Key: {
            pk: 'USER#' + username,
            sk: 'USER#' + username
        },

        ExpressionAttributeValues: {
            ':Sub_category': sub_category,
            ':Category': category,
        },
        ExpressionAttributeNames: {
            "#sub_category": "sub_category",
            "#category": "category"
        },
        UpdateExpression: 'SET #category = :Category, #sub_category = :Sub_category',
        ReturnValues: "UPDATED_NEW"
    };
    await dynamo.update(query).promise();
    await addUsertoCategory(category, username)
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}

async function addUsertoCategory(category, username) {
    let user = await exports.getUserByEmail(username)
    for (let cat of category) {
        let result = await ifCategoryExsistForUser(cat, username)
        if (result.length === 0) {
            var item = {
                pk: cat.sk,
                sk: `USER#${username}`,
                user: user,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                active: true
            }
            const TableName = db_constant.category;
            const params = {
                TableName,
                Item: item,
                ConditionExpression: "attribute_not_exists(pk)"
            }
            await dynamo.put(params).promise();
        }
    }
    return true
}

exports.getUsersAllPost = async (event) => {
    let access_token = event.headers['authorization']
    let user_id = await auth.getUsernameFromJWTToken(access_token)
    var query = await utils.getQueryBegainsWith(user_id)
    let data, accumulated, ExclusiveStartKey, allData;

    if (user_id.start_key != null) {
        query['ExclusiveStartKey'] = user_id.start_key
    }
    data = await dynamo.query(query).promise();
    return data
}
async function ifCategoryExsistForUser(cat, username) {
    const getParams = {
        TableName: db_constant.category,
        KeyConditionExpression: '#pk = :category AND begins_with(#sk, :name)',
        ExpressionAttributeValues: {
            ':category': cat.sk,
            ':name': `USER#${username}`
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        }
    }
    let result = await dynamo.query(getParams).promise()
    return result.Items
}


exports.updateUserPreference = async (inputData) => {
    const TableName = db_constant.user_table;
    let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
    if (inputData.bio) {
        if (bio.length > 100) {
            return utils.sendResponse(500,
                JSON.stringify(responseHandler.LIMIT_EXCEED))

        }
    }
    if (inputData.gender) {
        if (!db_constant.Gender.includes(gender)) {
            return utils.sendResponse(400,
                JSON.stringify(responseHandler.GENDER))

        }
    }
    if (inputData.first_name == "") {
        return {
            "message": responseHandler.FNAME_VALIDATION
        }
    }
    if (inputData.last_name == "") {
        return {
            "message": responseHandler.LNAME_VALIDATION
        }
    }
    if (inputData.dob == "") {
        return {
            "message": responseHandler.DATE_VALIDATION
        }
    }
    let dobVerification = await utils.checkAgeLimit(new Date(dob))
    if (dobVerification == false) {
        return {
            "message": responseHandler.AGE_LIMIT
        }
    }
    if(inputData.user_name){
        let resultname=utils.containsSpecialChars(inputData.user_name)
        if(resultname){
            return utils.sendResponse(400,
                JSON.stringify(responseHandler.USER_NAME))
        }
    }
    var updateInput = utils.generateUpdateQuery(inputData)
    var query = {
        TableName,
        Key: {
            pk: 'USER#' + username,
            sk: 'USER#' + username
        },

        ExpressionAttributeValues: updateInput.ExpressionAttributeValues,
        ExpressionAttributeNames: updateInput.ExpressionAttributeNames,
        UpdateExpression: updateInput.UpdateExpression,
        ReturnValues: "UPDATED_NEW"
    };
    await dynamo.update(query).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}


exports.updateUserNotificationsPreference = async (notificationKey) => {
    const TableName = db_constant.user_table;
    let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
    var updateInput = utils.generateUpdateQuery(notificationKey)
    var query = {
        TableName,
        Key: {
            pk: 'USER#' + username,
            sk: 'USER#' + username
        },

        ExpressionAttributeValues: updateInput.ExpressionAttributeValues,
        ExpressionAttributeNames: updateInput.ExpressionAttributeNames,
        UpdateExpression: updateInput.UpdateExpression,
        ReturnValues: "UPDATED_NEW"
    };
    await dynamo.update(query).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}


exports.updateW9Form = async (formDataValue,event) => {
    const { name, business_name, tax_classification, tax_id, country, city,address,state,postal_code,form_w9_url } = formDataValue;
    const TableName = db_constant.user_table;
    let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
    if(name.length>30){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if(business_name.length>30){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))

    }
    if(tax_id.length>12){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if(country.length>30){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if(address.length>50){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if(state.length>20){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if(postal_code.length>15){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.LIMIT_EXCEED))
    }
    if (!db_constant.Tax_classification_Name.includes(tax_classification)) {
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.NOT_MATCH))

    }
   for(var value in formDataValue){
       if(formDataValue[value].trim() ===""){
        return utils.sendResponse(400,
            JSON.stringify(responseHandler.MANDAOTRY_FIELD))

       }
   }
    var query = {
        TableName,
        Key: {
            pk: 'USER#' + username,
            sk: 'USER#' + username
        },

        ExpressionAttributeValues: {
            ':W9_form_data': formDataValue,
        },
        ExpressionAttributeNames: {
            "#w9_form_data": "w9_form_data"
        },
        UpdateExpression: 'SET #w9_form_data = :W9_form_data',
        ReturnValues: "UPDATED_NEW"
    };
    await dynamo.update(query).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}
exports.getLoggedInUsers = async (event) => {
   // console.log("====================================",JSON.stringify(event))
   // This method will change after admin integration
   let access_token = event.headers['authorization']
    let username = await auth.getUsernameFromJWTToken(access_token)
     // let username="topfans19@yopmail.com" 
     const getParams = {
        TableName: db_constant.user_table,
        KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
        ExpressionAttributeValues: {       
                ':pk': `USER#${username}`,
                ':sk': `USER#${username}`            
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        }
        
    }
    let result = await dynamo.query(getParams).promise()
    return result.Items
}
