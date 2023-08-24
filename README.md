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