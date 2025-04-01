import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from "./network/getAlgoClientConfigs";
import { AlgoDidClient, AlgoDidFactory, Metadata } from "../contracts/AlgoDID";
import algosdk, { TransactionSigner } from "algosdk";

const algodConfig = getAlgodConfigFromViteEnvironment();
const indexerConfig = getIndexerConfigFromViteEnvironment();

export const algorand = AlgorandClient.fromConfig({
  algodConfig: {
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token,
  },
  indexerConfig: {
    server: indexerConfig.server,
    port: indexerConfig.port,
    token: indexerConfig.token,
  },
});

export const getDidFromContract = async (
  address: string,
  appId: bigint
): Promise<{ did: string; didDocument: any } | null> => {
  try {
    const algoDidClient = new AlgoDidClient({
      appId: appId,
      algorand,
    });

    const metadatabox = await algoDidClient.state.box.metadata.value(address);

    if (!metadatabox) {
      return null;
    }

    const boxDataPromises = [];
    for (let i = metadatabox.start; i <= metadatabox.end; i++) {
      boxDataPromises.push(algoDidClient.state.box.dataBoxes.value(i));
    }

    const boxData = (await Promise.all(boxDataPromises)).map((data) => {
      if (data) {
        return data;
      }
      return Buffer.alloc(0);
    });

    const data = Buffer.concat(boxData);
    const didDocument = JSON.parse(data.toString("utf-8"));
    return {
      did: didDocument["id"],
      didDocument,
    };
  } catch (e) {
    return null;
  }
};

const COST_PER_BYTE = 400;
const COST_PER_BOX = 2500;
const MAX_BOX_SIZE = 32768;

const BYTES_PER_CALL =
  2048 -
  4 - // 4 bytes for the method selector
  34 - // 34 bytes for the key
  8 - // 8 bytes for the box index
  8; // 8 bytes for the offset

export const createDidDocument = async (
  address: string,
  signer: TransactionSigner
): Promise<{ did: string; didDocument: any }> => {
  const appFactory = new AlgoDidFactory({
    defaultSigner: signer,
    defaultSender: address,
    algorand,
  });

  const { result: appDeployResult, appClient } =
    await appFactory.send.create.createApplication();
  const addressHex = Buffer.from(
    algosdk.decodeAddress(address).publicKey
  ).toString("hex");
  const networkDetails = await algorand.client.network();
  const network = networkDetails.isLocalNet
    ? "localnet"
    : networkDetails.isTestNet
      ? "testnet"
      : "mainnet";
  const didDocument = `{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:algo:${network}:app:${appDeployResult.appId}:${addressHex}",
  "verificationMethod": [
    {
      "id": "did:algo:${network}:app:${appDeployResult.appId}:${addressHex}#master",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:algo:${network}:app:${appDeployResult.appId}:${addressHex}"
    }
  ],
  "authentication": [
    "did:algo:${network}:app:${appDeployResult.appId}:${addressHex}#master"
  ]
}`;
  const didDocumentBuffer = Buffer.from(didDocument, "utf-8");

  const ceilBoxes = Math.ceil(didDocumentBuffer.byteLength / MAX_BOX_SIZE);

  const endBoxSize = didDocumentBuffer.byteLength % MAX_BOX_SIZE;

  const totalCost =
    ceilBoxes * COST_PER_BOX + // cost of data boxes
    (ceilBoxes - 1) * MAX_BOX_SIZE * COST_PER_BYTE + // cost of data
    ceilBoxes * 8 * COST_PER_BYTE + // cost of data keys
    endBoxSize * COST_PER_BYTE + // cost of last data box
    COST_PER_BOX +
    (8 + 8 + 1 + 8 + 32 + 8) * COST_PER_BYTE; // cost of metadata box

  const startUploadGrp = appClient.newGroup();
  startUploadGrp.addTransaction(
    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: address,
      receiver: appDeployResult.appAddress,
      amount: algosdk.algosToMicroalgos(0.1),
      suggestedParams: await algorand.getSuggestedParams(),
    }),
    signer
  );

  const mbrPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: address,
    receiver: appDeployResult.appAddress,
    amount: totalCost,
    suggestedParams: await algorand.getSuggestedParams(),
  });

  await startUploadGrp
    .startUpload({
      args: {
        pubKey: address,
        numBoxes: ceilBoxes,
        endBoxSize: endBoxSize,
        mbrPayment: mbrPayment,
      },
      boxReferences: [algosdk.decodeAddress(address).publicKey],
    })
    .send();

  const metadatabox = await appClient.state.box.metadata.value(address);
  if (!metadatabox) {
    throw new Error("Failed to create metadata box");
  }

  const numBoxes = Math.floor(didDocumentBuffer.byteLength / MAX_BOX_SIZE);
  const boxData: Buffer[] = [];

  for (let i = 0; i < numBoxes; i += 1) {
    const box = didDocumentBuffer.subarray(
      i * MAX_BOX_SIZE,
      (i + 1) * MAX_BOX_SIZE
    );
    boxData.push(box);
  }

  boxData.push(
    didDocumentBuffer.subarray(
      numBoxes * MAX_BOX_SIZE,
      didDocumentBuffer.byteLength
    )
  );

  const uploadPromises = boxData.map(async (box, boxIndexOffset) => {
    const boxIndex = metadatabox.start + BigInt(boxIndexOffset);
    const numChunks = Math.ceil(box.byteLength / BYTES_PER_CALL);

    const chunks: Buffer[] = [];

    for (let i = 0; i < numChunks; i += 1) {
      chunks.push(box.subarray(i * BYTES_PER_CALL, (i + 1) * BYTES_PER_CALL));
    }

    const boxRef = { appId: 0, name: algosdk.encodeUint64(boxIndex) };
    const boxes = new Array(7).fill(boxRef);

    boxes.push({ appId: 0, name: algosdk.decodeAddress(address).publicKey });

    const firstGroup = chunks.slice(0, 8);
    const secondGroup = chunks.slice(8);

    const firstUploadGrp = appClient.newGroup();
    firstGroup.forEach((chunk, chunkIndex) => {
      firstUploadGrp.upload({
        args: {
          pubKey: address,
          boxIndex,
          offset: BYTES_PER_CALL * (0 + chunkIndex),
          data: chunk,
        },
        boxReferences: boxes,
      });
    });
    await firstUploadGrp.send();

    if (secondGroup.length === 0) return;

    const secondUploadGrp = appClient.newGroup();
    secondGroup.forEach((chunk, chunkIndex) => {
      secondUploadGrp.upload({
        args: {
          pubKey: address,
          boxIndex,
          offset: BYTES_PER_CALL * (8 + chunkIndex),
          data: chunk,
        },
        boxReferences: boxes,
      });
    });
    await secondUploadGrp.send();
  });

  await Promise.all(uploadPromises);
  if (
    Buffer.concat(boxData).toString("hex") !== didDocumentBuffer.toString("hex")
  ) {
    throw new Error("data validation failed");
  }

  await appClient.send.finishUpload({
    args: { pubKey: address },
    boxReferences: [
      { appId: 0n, name: algosdk.decodeAddress(address).publicKey },
    ],
  });

  return {
    did: `did:algo:${network}:app:${appDeployResult.appId}:${addressHex}`,
    didDocument: didDocument,
  };
};
