import { useWallet } from "@txnlab/use-wallet-react";
import { useState, useEffect } from "react";
import ConnectWallet from "./components/ConnectWallet";
import { CreateDID } from "./components/CreateDID";
import { Issuer } from "./Issuer";
import { Prover } from "./Prover";
import { Verifier } from "./Verifier";
import { algorand, createDidDocument, getDidFromContract } from "./utils";

interface HomeProps {
  activeRole: "issuer" | "prover" | "verifier";
}

export const Home = ({ activeRole }: HomeProps) => {
  const [selectedDid, setSelectedDid] = useState<string | null>(null);
  const [userDids, setUserDids] = useState<
    { did: string; didDocument: any }[] | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const [createDIDModal, setCreateDIDModal] = useState<boolean>(false);
  const { activeAddress, activeAccount, transactionSigner } = useWallet();

  const copyToClipboard = () => {
    if (selectedDid) {
      navigator.clipboard.writeText(selectedDid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const getDIDs = async (address: string) => {
      const accountDetails = await algorand.account.getInformation(address);
      if (accountDetails.createdApps) {
        const dids: { did: string; didDocument: any }[] = [];
        for (let i = 0; i < accountDetails.createdApps.length; i++) {
          const appId = accountDetails.createdApps[i].id;
          const didDocument = await getDidFromContract(address, appId);
          if (didDocument) {
            dids.push(didDocument);
          }
        }
        setUserDids(dids);
      }
    };
    if (activeAccount && !userDids) {
      getDIDs(activeAccount.address);
    }
  }, [activeAccount]);

  const [isCreatingDID, setIsCreatingDID] = useState(false);
  const createDID = async () => {
    setIsCreatingDID(true);
    try {
      if (activeAddress) {
        const didDocument = await createDidDocument(
          activeAddress,
          transactionSigner
        );
        setUserDids((prevDids) => [
          ...(prevDids || []),
          { did: didDocument.did, didDocument: didDocument.didDocument },
        ]);
      }
    } catch (error) {
      console.error("Error creating DID:", error);
    } finally {
      setIsCreatingDID(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-black flex justify-center items-center">
      <div className="hero-content text-center rounded-lg p-10 max-w-lg bg-white shadow-lg">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold">
            KYC Verification - {activeRole.toUpperCase()}
          </h1>
          <div className="grid">
            {activeAddress && (
              <div className="flex flex-col justify-between items-center gap-2 my-6">
                <div className="mt-4">
                  {!userDids ? (
                    <div className="w-full text-center p-4">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading DIDs...
                      </p>
                    </div>
                  ) : userDids.length === 0 ? (
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>No DIDs found. Create one to get started.</span>
                    </div>
                  ) : (
                    <select
                      className="select select-bordered w-full max-w-xs"
                      value={selectedDid || ""}
                      onChange={(e) => setSelectedDid(e.target.value)}
                    >
                      <option value="">
                        Select a DID
                      </option>
                      {userDids.map((did) => (
                        <option key={did.did} value={did.did}>
                          {did.did.slice(0, 20)}...{did.did.slice(-20)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {!selectedDid && userDids && (
                  <button
                    className="btn m-2 w-full"
                    disabled={isCreatingDID}
                    onClick={createDID}
                  >
                    Create new Decentralized Identifier (DID)
                  </button>
                )}
                <div>
                  <h2 className="text-xl">Decentralized Identifier</h2>
                  <div className="flex items-center justify-center space-x-2">
                    <button className="btn btn-outline w-full text-sm break-all">
                      {selectedDid ? selectedDid : "Please Select a DID"}
                    </button>
                    <button
                      className="btn btn-primary m-2"
                      onClick={copyToClipboard}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn m-2 w-full"
              onClick={() => setOpenWalletModal(true)}
            >
              {activeAddress ? " Disconnect Wallet" : "Connect Wallet"}
            </button>
          </div>
          {activeRole === "issuer" && <Issuer didValue={selectedDid} />}
          {activeRole === "prover" && <Prover didValue={selectedDid} />}
          {activeRole === "verifier" && <Verifier didValue={selectedDid} />}
          <ConnectWallet
            openModal={openWalletModal}
            closeModal={() => setOpenWalletModal(false)}
          />
        </div>
      </div>
    </div>
  );
};
