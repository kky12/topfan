const expect = require('chai').expect
const MOCK = require('aws-sdk-mock');
const AWS = require('aws-sdk');

describe('querying items from dynamodb', function(){
    var params = {
        TopFansDb,
        Item: {
            first_name: "vaishali",
            last_name: "vinay",
            email: "vaishali.singh@gmail.com",
            birth_date: 1995-07-14,
            pk: 'USER#' + "vaishali.singh@gmail.com",
            sk: 'USER#' + "vaishali.singh@gmail.com",
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
    before(() => {
      // set up a mock call to DynamoDB
      MOCK.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
        console.log('Let us not call AWS DynamoDB and say we did.');
  
        // return fake data
        let fakeData = {
          Item: {
            
          }
        };
  
        return callback(null, fakeData);
      });
    });
  
    after(() => {
      // restore normal function
      MOCK.restore('DynamoDB.DocumentClient');
    });
    
// describe('User functions', () => {
//     it('User Sign-Up || Success', done => {
//         expect(true).to.equal(true);
//         done();
//     })
// })
})
