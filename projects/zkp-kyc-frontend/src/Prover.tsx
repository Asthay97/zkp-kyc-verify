import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
// import SubmitProof from './components/SubmitProof' // New component for proof submission

interface ProverProps {}

const Prover: React.FC<ProverProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [submitProofModal, setSubmitProofModal] = useState<boolean>(false)
  const [createDIDModal, setCreateDIDModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const didValue = 'did:algo:testnet:app:736531400:7344dfd206bf8859f0605ba07081f316a45f0c13af1a632f6c979f738eb21c1a'
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(didValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="hero min-h-screen bg-black flex justify-center items-center">
      <div className="hero-content text-center rounded-lg p-10 max-w-lg bg-white shadow-lg">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold">KYC Verification - PROVER</h1>

        <div className="grid">
            <div className="py-10">
              <h2 className="text-xl">Decentralized Identifier</h2>
              <div className="flex items-center justify-center space-x-2">
                <button className="btn btn-outline w-full text-sm break-all">{didValue}</button>
                <button className="btn btn-primary m-2" onClick={copyToClipboard}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

          <button className="btn m-2 w-full" onClick={() => setOpenWalletModal(true)}>
            Wallet Connection
          </button>

          {activeAddress && (
            <>
              <button className="btn m-2 w-full" onClick={() => setCreateDIDModal(true)}>
                Create Decentralized Identifier (DID)
              </button>
              <button className="btn m-2 w-full" onClick={() => setSubmitProofModal(true)}>
                Add Signed Claim
              </button>
              <button className="btn m-2 w-full" onClick={() => setSubmitProofModal(true)}>
                View Signed Credentials
              </button>
              <button className="btn m-2 w-full" onClick={() => setSubmitProofModal(true)}>
                Submit ZK Proof
              </button>
              {/* <button className="btn m-2 w-full" onClick={() => setOpenDemoModal(true)}>
                Transactions Demo
              </button>
              <button className="btn m-2 w-full" onClick={() => setAppCallsDemoModal(true)}>
                Contract Interactions Demo
              </button> */}
            </>
          )}
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
        <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
        <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />

        {/* <SubmitProof openModal={submitProofModal} closeModal={() => setSubmitProofModal(false)} /> */}
      </div>
      </div>
    </div>
  )
}

export default Prover
