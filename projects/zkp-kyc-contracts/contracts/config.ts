import { config } from "dotenv";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

// Load environment variables from .env file
config({ path: __dirname + `/../.env` });

// Check if required environment variables are present
if (!process.env.CURRENT_NETWORK || !process.env.DEPLOYER_WALLET_MNEMONIC) {
  throw new Error(
    "Missing environment variables. Please make sure to create a .env file in the contracts directory of the project and add the following variables: DEPLOYER_WALLET_MNEMONIC, CURRENT_NETWORK"
  );
}

// Export environment variables

export const CURRENT_NETWORK = process.env.CURRENT_NETWORK as
  | "localnet"
  | "testnet"
  | "mainnet";
export const DEPLOYER_WALLET_MNEMONIC = process.env
  .DEPLOYER_WALLET_MNEMONIC as string;

let algorand: AlgorandClient;
if (CURRENT_NETWORK === "localnet") {
  algorand = AlgorandClient.defaultLocalNet();
} else if (CURRENT_NETWORK === "testnet") {
  algorand = AlgorandClient.testNet();
} else if (CURRENT_NETWORK === "mainnet") {
  algorand = AlgorandClient.mainNet();
} else {
  throw new Error(`Invalid CURRENT_NETWORK: ${CURRENT_NETWORK}`);
}

const deployer = algorand.account.fromMnemonic(DEPLOYER_WALLET_MNEMONIC);

export { algorand, deployer };
