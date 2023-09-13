# Sample Hardhat

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# memo

### STEP1: Create and compile the Solidity file

```
npx hardhat
rm contracts/Lock.sol
```

create ***.sol

```
npx hardhat compile
```

### STEP2: Update the deployment script

create scripts/deploy.js


### STEP3: Deploy smart contract


```
npx hardhat run --network goerli scripts/deploy.js
```

### setup environment

```
NETWORK=goerli
FIREBLOCKS_API_KEY_SIGNER=
FIREBLOCKS_API_KEY_NONSIGNINGADMIN=
FIREBLOCKS_API_KEY_ADMIN=
FIREBLOCKS_URL=https://api.fireblocks.io
FIREBLOCKS_VAULT_ACCOUNT_ID=
COIN_CA_OWNED_SIGNER=
COIN_CA_OWNED_ADMIN=
METAMASK=
```

### STEP4: setup lambda


#### deplicated
```
cd webhook
zip -r layer.zip node_modules
aws s3 cp layer.zip s3://YOUR_BUCKET_NAME/DATE/

cd lambda
zip -r lf_fireblocks-webhook.zip index.js
aws lambda update-function-code --function-name <FUNCTION_NAME> --zip-file fileb://lf_fireblocks-webhook.zip

```

#### latest
```
cd webhook
zip -r lf_all.zip ./
aws lambda update-function-code --function-name <FUNCTION_NAME> --zip-file fileb://lf_all.zip
```

### STEP5: run script

```
cd <PROJECT_ROOT>
node testScript/test02.js
```
