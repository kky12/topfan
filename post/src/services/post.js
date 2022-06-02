
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const db_constant = require("../config/db-constants.json")
const utils = require('../lib/utils')
const utils01 = require('util01')

exports.insertPostInDB = async (body, event) => {

    var { type, description, link, media_url, collaborating_creatory, display_in_my_feed,
        display_in_discovery_feed, subscription, individual_price, revenue_split, question,
        options, expiry_date, expiry_time } = body;

    utils.isEmpty(type, 'Type');
    //utils.isEmpty(user_id, 'USER ID');

    let access_token = event.headers['authorization']
    // let access_token = event.headers.Authorization;
    let username = await utils01.getUsernameFromJWTToken(access_token)

    switch (type) {
        case "text":
            utils.isEmpty(description, 'Description');
            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#TEXT`,
                type: 'text',
                description,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "image":
            utils.isEmpty(description, 'Description');
            utils.isEmptyObject(media_url, 'Image');
            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#IMAGE`,
                type: 'image',
                description,
                media_url,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "video":
            utils.isEmpty(description, 'Description');
            utils.isEmpty(display_in_my_feed, 'Display in my Feed');
            //utils.isEmpty(display_in_discovery_feed, 'Display in discovery Feed');
            utils.isEmpty(subscription, 'Subscription');
            utils.isEmpty(individual_price, 'Individual Price');
            utils.isEmpty(revenue_split, 'Revenue Split');
            utils.isEmptyObject(media_url, 'Video');
            utils.isEmptyObject(collaborating_creatory, 'Collaborating Creatory');

            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#VIDEO`,
                type: 'video',
                description,
                media_url,
                collaborating_creatory,
                display_in_my_feed,
                display_in_discovery_feed,
                subscription,
                individual_price,
                revenue_split,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "audio":
            utils.isEmpty(description, 'Description');
            utils.isEmpty(display_in_my_feed, 'Display in my Feed');
            utils.isEmpty(subscription, 'Subscription');
            utils.isEmpty(individual_price, 'Individual Price');
            utils.isEmpty(revenue_split, 'Revenue Split');
            utils.isEmptyObject(media_url, 'Audio');
            utils.isEmptyObject(collaborating_creatory, 'Collaborating Creatory');

            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#AUDIO`,
                type: 'audio',
                description,
                media_url,
                collaborating_creatory,
                display_in_my_feed,
                display_in_discovery_feed,
                subscription,
                individual_price,
                revenue_split,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "poll":
            utils.isEmpty(question, 'Question');
            utils.isEmpty(expiry_date, 'Expiry Date');
            utils.isEmpty(expiry_time, 'Expiry Time');
            utils.isEmpty(question, 'Question');
            utils.isEmpty(subscription, 'Subscription');
            utils.isEmpty(individual_price, 'Individual Price');
            utils.isEmpty(revenue_split, 'Revenue Split');
            utils.isEmpty(media_url, 'Image');
            utils.isEmptyObject(options, 'Options');
            utils.isEmptyObject(collaborating_creatory, 'Collaborating Creatory');

            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#POLL`,
                type: 'poll',
                question,
                media_url,
                options,
                collaborating_creatory,
                expiry_date,
                expiry_time,
                subscription,
                individual_price,
                revenue_split,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "link":
            utils.isEmpty(link, 'Link');
            var item = {
                pk: `USER#${username}`,
                sk: `POST#${utils.dateFun().date}${utils01.dateFun()}#LINK`,
                type: 'link',
                link,
                publish: true,
                publish_date: utils.dateFun().pdate,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        default:
            throw new Error('Unknown post type: ' + type);
    }

    const TableName = db_constant.post;
    const params = {
        TableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)"
    }
    return await dynamo.put(params).promise();
}

exports.updatePostInDB = async (item) => {
    const TableName = db_constant.post;
    const params = {
        TableName,
        Key: {
            pk: item.pk,
            sk: item.sk
        },
        ExpressionAttributeValues: {
            ":cn": item.post_name,
            ":ua": item.date,
            ":ac": item.active
        },
        UpdateExpression: "SET post_name = :cn, updated_at = :ua, active = :ac",
        ReturnValues: "ALL_NEW"
    };
    return await dynamo.update(params).promise();
}

exports.getUsersAllPost = async (user_id) => {
    var query = await utils.getQueryBegainsWith(user_id)
    let data, accumulated, ExclusiveStartKey, allData;

    if (user_id.start_key != null) {
        query['ExclusiveStartKey'] = user_id.start_key
    }
    data = await dynamo.query(query).promise();
    return data
}