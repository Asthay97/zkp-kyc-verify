import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import CreateClaim from './components/CreateClaim'
import Transact from './components/Transact'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [createDIDModal, setCreateDIDModal] = useState<boolean>(false)
  const [createClaimModal, setCreateClaimModal] = useState<boolean>(false)

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
          <h1 className="text-2xl font-bold">KYC Verification - ISSUER</h1>

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
                <button className="btn m-2 w-full" onClick={() => setCreateClaimModal(true)}>
                  Create Claim
                </button>
                <button className="btn m-2 w-full" onClick={() => setOpenDemoModal(true)}>
                  Transactions Demo
                </button>
                <button className="btn m-2 w-full" onClick={() => setAppCallsDemoModal(true)}>
                  Contract Interactions Demo
                </button>
              </>
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
          <CreateClaim openModal={createClaimModal} closeModal={() => setCreateClaimModal(false)} issuerDID={didValue} />
        </div>
      </div>
    </div>
  )
}

export default Home
