import { useWallet } from "@txnlab/use-wallet-react";
import { useState } from "react";

interface ProverProps {
  didValue: string | null;
}

export const Prover = ({ didValue }: ProverProps) => {
  const [addSignedClaimModal, setAddSignedClaimModal] =
    useState<boolean>(false);
  const [viewSignedCredentialsModal, setViewSignedCredentialsModal] =
    useState<boolean>(false);
  const [submitProofModal, setSubmitProofModal] = useState<boolean>(false);
  const { activeAddress } = useWallet();

  return (
    <>
      {activeAddress && didValue && (
        <>
          <button
            className="btn m-2 w-full"
            onClick={() => setAddSignedClaimModal(true)}
          >
            Add Signed Claim
          </button>
          <button
            className="btn m-2 w-full"
            onClick={() => setViewSignedCredentialsModal(true)}
          >
            View Signed Credentials
          </button>
          <button
            className="btn m-2 w-full"
            onClick={() => setSubmitProofModal(true)}
          >
            Submit ZK Proof
          </button>
        </>
      )}
    </>
  );
};
