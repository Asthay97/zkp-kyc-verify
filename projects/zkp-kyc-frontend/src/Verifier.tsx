import { useWallet } from "@txnlab/use-wallet-react";
import { useState } from "react";

interface VerifierProps {
  didValue: string | null;
}

export const Verifier = ({ didValue }: VerifierProps) => {
  const [verifyProofModal, setVerifyProofModal] = useState<boolean>(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const { activeAddress } = useWallet();

  return (
    <>
      {activeAddress && didValue && (
        <>
          <button
            className="btn m-2 w-full"
            onClick={() => {
              // Simulating Prove Access Rights output
              const result = true; // Replace this with actual verification logic
              if (result) {
                setAccessGranted(true);
              }
              setVerifyProofModal(true);
            }}
          >
            Prove Access Rights
          </button>

          <button
            className={`btn m-2 w-full ${!accessGranted ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!accessGranted}
          >
            Enter to our Site
          </button>
        </>
      )}
    </>
  );
};
