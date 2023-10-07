import * as fs from "fs";
import * as path from "path";

import { FireblocksSDK, PeerType, TransactionOperation, TransactionStatus } from "fireblocks-sdk";

async function signArbitraryMessage(apiClient: FireblocksSDK, vaultAccountId: string, message: string, addressIndex = 0) { 
    
    const { status, id } = await apiClient.createTransaction({ 
        operation: "TYPED_MESSAGE",
        assetId: "ETH",
        source: { type: PeerType.VAULT_ACCOUNT,
           id: vaultAccountId
        },
        note: `Test Message`,
        extraParameters: {
            rawMessageData: {
                messages: [{
                    content: Buffer.from(message).toString("hex"),
                    index: addressIndex,
                    type: "ETH_MESSAGE"
                }]
            }
        }
    });
    let currentStatus = status;
    let txInfo;

    while (currentStatus != TransactionStatus.COMPLETED && currentStatus != TransactionStatus.FAILED) { 
        try { 
            console.log("keep polling for tx " + id + "; status: " + currentStatus);
            txInfo = await apiClient.getTransactionById(id); currentStatus = txInfo.status; 
        } catch (err) {
            console.log("err", err); 
        }
        await new Promise(r => setTimeout(r, 1000));
    };
    
    if(currentStatus == TransactionStatus.FAILED) {
        throw "Transaction failed. Substatus: " + txInfo.subStatus;
    }

    const walletAddresses = await apiClient.getDepositAddresses(vaultAccountId, "ETH");

    console.log(walletAddresses);
    console.log("Address: ", walletAddresses[0].address); console.log("Message: ", message);
        
    const signature = txInfo.signedMessages[0].signature;
    const v = 27 + signature.v;
    console.log("Signature: ", "0x" + signature.r + signature.s + v.toString(16));
}

const apiSecret = fs.readFileSync(path.resolve(__dirname, "./fireblocks_secret.key"), "utf8");
const apiKey = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const apiClient = new FireblocksSDK(apiSecret, apiKey);
signArbitraryMessage(apiClient, "0", "INSERT TEXT HERE").then(console.log).catch(console.log)