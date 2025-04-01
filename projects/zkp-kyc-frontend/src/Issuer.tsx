import { useWallet } from "@txnlab/use-wallet-react";
import { useState } from "react";
import CreateClaim from "./components/CreateClaim";

interface IssuerProps {
  didValue: string | null;
}

export const Issuer = ({ didValue }: IssuerProps) => {
  const [createClaimModal, setCreateClaimModal] = useState<boolean>(false);

  const { activeAddress } = useWallet();

  return (
    <>
      {activeAddress && didValue && (
        <>
          <button
            className="btn m-2 w-full"
            onClick={() => setCreateClaimModal(true)}
          >
            Create Claim
          </button>

          <CreateClaim
            openModal={createClaimModal}
            closeModal={() => setCreateClaimModal(false)}
            issuerDID={didValue}
          />
        </>
      )}
    </>
  );
};
