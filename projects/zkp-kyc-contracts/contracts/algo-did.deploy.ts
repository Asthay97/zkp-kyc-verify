import { algorand, deployer } from "./config";
import { AlgoDidFactory } from "./clients/AlgoDIDClient";

// deploy the smart contract to an Algorand network
async function deploy() {
  // Check if deployer account has enough funds to perform the deployment
  // operation
  const { balance, minBalance } = await algorand.account.getInformation(
    deployer.addr
  );
  if (balance.algos - minBalance.algos < 1) {
    throw Error(
      `Account ${deployer.addr} has less than 1 usable algo. Please fund it and try again.`
    );
  }

  // Create application Factory and deploy the application
  const appFactory = new AlgoDidFactory({
    defaultSigner: deployer.signer,
    defaultSender: deployer.addr,
    algorand,
  });
  const result = await appFactory.send.create.createApplication();

  console.log(
    `Application created with ID ${result.result.appId} and address ${result.result.appAddress}`
  );
}

deploy();
