require('dotenv').config({ path: '.env'});

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");
const { inspect } = require('util');


// ##### initializer ####################################
const slackClient = new WebClient(process.env.SLACK_OAUTH_TOKEN, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
});

const channel = process.env.SLACK_POST_CHANNEL;

// ##### post message #####
async function postSlack(){
    try {
        const response = await slackClient.chat.postMessage({
            channel: channel,
            text: "hello",
        });
        console.log("slackResponse: ", response);
    } catch (error) {
        console.error("Error posting message: ", error);
        //console.dir(error, { depth: null });
    }
}

// ##### get conversation history #####
async function getConversationHistory(){
    try{
        const result = await slackClient.conversations.history({
            channel: channel,
            limit: 5,
        });
        console.log(result.messages);
        return result.messages
    }catch(error){
        console.error("get conversation error: ",error);
        console.dir(error, { depth: null });
    }
}

// ##### search tx_id from conversation history #####
async function search_timestamp_for_txID(target_txid){
    const conversations = await getConversationHistory();
    console.log(conversations);
    conversations.forEach((item,index) =>{
        if(item.attachments){
            console.log(`Index ${index}: found attachments`);

            item.attachments.forEach((attachment) =>{
                console.log(`Attachment inner`);

                const regex = /transaction ID : `(.+?)`/;
                const matches = attachment.text.match(regex);

                if(matches && matches[1]){
                    console.log(`Found Transaction ID: ${matches[1]}`);

                    if(matches[1] === target_txid){
                        console.log(`Match TS: ${item.ts}`);
                        return item.ts;
                    }

                }else
                    console.log(`Couldn't find Transaction ID`);
            });
        }
    })
}

txid="063c3799-7515-4f56-8845-ab42323f987d";
thread = search_timestamp_for_txID(txid);