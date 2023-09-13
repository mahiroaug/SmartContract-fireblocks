const { WebClient } = require('@slack/web-api');
const crypto = require("crypto");

const publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0+6wd9OJQpK60ZI7qnZG
jjQ0wNFUHfRv85Tdyek8+ahlg1Ph8uhwl4N6DZw5LwLXhNjzAbQ8LGPxt36RUZl5
YlxTru0jZNKx5lslR+H4i936A4pKBjgiMmSkVwXD9HcfKHTp70GQ812+J0Fvti/v
4nrrUpc011Wo4F6omt1QcYsi4GTI5OsEbeKQ24BtUd6Z1Nm/EP7PfPxeb4CP8KOH
clM8K7OwBUfWrip8Ptljjz9BNOZUF94iyjJ/BIzGJjyCntho64ehpUYP8UJykLVd
CGcu7sVYWnknf1ZGLuqqZQt4qt7cUUhFGielssZP9N9x7wzaAIFcT3yQ+ELDu1SZ
dE4lZsf2uMyfj58V8GDOLLE233+LRsRbJ083x+e2mW5BdAGtGgQBusFfnmv5Bxqd
HgS55hsna5725/44tvxll261TgQvjGrTxwe7e5Ia3d2Syc+e89mXQaI/+cZnylNP
SwCCvx8mOM847T0XkVRX3ZrwXtHIA25uKsPJzUtksDnAowB91j7RJkjXxJcz3Vh1
4k182UFOTPRW9jzdWNSyWQGl/vpe9oQ4c2Ly15+/toBo4YXJeDdDnZ5c/O+KKadc
IMPBpnPrH/0O97uMPuED+nI6ISGOTMLZo35xJ96gPBwyG5s2QxIkKPXIrhgcgUnk
tSM7QYNhlftT4/yVvYnk0YcCAwEAAQ==
-----END PUBLIC KEY-----`.replace(/\\n/g, "\n");


exports.handler = async (event, context) => {
    
    // ##### initializer ####################################
    const slackClient = new WebClient(process.env.SLACK_OAUTH_TOKEN);
    const channel = process.env.SLACK_POST_CHANNEL;

    const currentUnixTime = Math.floor(Date.now() / 1000);

    // ##### verify signature ####################################
    console.log("event-headers:",event.headers);
    console.log("event-body:",event.body); // event.body(ojbect)
    
    const message = JSON.stringify(event.body); // message(JSON)
    const signature = event.headers["Fireblocks-Signature"];
    const verifier = crypto.createVerify('RSA-SHA512');
    verifier.write(message);
    verifier.end();
    const isVerified = verifier.verify(publicKey, signature, "base64");
    console.log("Verified:", isVerified);


    // ##### outputJSON #########################################
    const inputJSON = JSON.parse(event.body); //inputJSON(object)
    console.log("inputJSON:",inputJSON);

    const attachments = [
        {
            pretext: "fireblocks notification",
            fallback: "no data",
            color: "#B1063A",
            author_name: "fireblocks - Optage(testnet)",
            title: inputJSON.type,
            text: "transaction ID : `" + inputJSON.data.id + "`",
            fields: [
                {
                    title: "source",
                    value: inputJSON.data.source.type + "\n" + inputJSON.data.source.name,
                    short: "true"
                },
                {
                    title: "destination",
                    value: inputJSON.data.destination.type + "\n" + inputJSON.data.destination.name,
                    short: "true"
                },
                {
                    title: "opration/amount",
                    value: inputJSON.data.operation + "\n" + inputJSON.data.amount + " " + inputJSON.data.assetId,
                    short: "true"
                },
                {
                    title: "status",
                    value: inputJSON.data.status,
                    short: "true"
                },
            ],
            footer: inputJSON.data.note + " (" + inputJSON.data.createdBy + ") ",
            ts: currentUnixTime
        }
    ]

    if (inputJSON.data.status === "QUEUED"){
        console.log("Status is QUEUED, so skipped posting slack");
        return {
            statusCode: 200,
            body: "ok"
        };
    }


    // ##### post slack #########################################
    await postSlack(slackClient,channel,attachments);


    return {
        statusCode: 200,
        body: "ok"
    };
};

async function postSlack(slackClient, channel, attachments) {
    try {
        const response = await slackClient.chat.postMessage({
            channel: channel,
            //text: attachments,
            attachments: attachments,
            as_user: true
        });
        console.log("slackResponse: ", response);
        return response;
    } catch (error) {
        console.error("Error posting message: ", error);
    }
}