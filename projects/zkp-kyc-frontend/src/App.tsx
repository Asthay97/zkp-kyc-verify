import React, { useState } from 'react'
import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import Home from './Home'
import Prover from './Prover'
import Verifier from './Verifier'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
  ]
}

export default function App() {
  const [activeRole, setActiveRole] = useState<'issuer' | 'prover' | 'verifier'>('issuer')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-black">
          {/* Role Selection Navigation */}
          <nav className="flex justify-center bg-gray-800 text-white py-3 shadow-md">
            <div className="flex space-x-6 rounded-full bg-gray-700 p-2">
              <button
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeRole === 'issuer' ? 'bg-white text-black font-bold shadow-md' : 'hover:bg-gray-600'
                }`}
                onClick={() => setActiveRole('issuer')}
              >
                Issuer
              </button>
              <button
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeRole === 'prover' ? 'bg-white text-black font-bold shadow-md' : 'hover:bg-gray-600'
                }`}
                onClick={() => setActiveRole('prover')}
              >
                Prover
              </button>
              <button
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeRole === 'verifier' ? 'bg-white text-black font-bold shadow-md' : 'hover:bg-gray-600'
                }`}
                onClick={() => setActiveRole('verifier')}
              >
                Verifier
              </button>
            </div>
          </nav>

          {/* Role-based Rendering */}
          {activeRole === 'issuer' && <Home />}
          {activeRole === 'prover' && <Prover />}
          {activeRole === 'verifier' && <Verifier />}
        </div>
      </WalletProvider>
    </SnackbarProvider>
  )

}


// import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
// import { SnackbarProvider } from 'notistack'
// import Home from './Home'
// import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

// let supportedWallets: SupportedWallet[]
// if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
//   const kmdConfig = getKmdConfigFromViteEnvironment()
//   supportedWallets = [
//     {
//       id: WalletId.KMD,
//       options: {
//         baseServer: kmdConfig.server,
//         token: String(kmdConfig.token),
//         port: String(kmdConfig.port),
//       },
//     },
//   ]
// } else {
//   supportedWallets = [
//     { id: WalletId.DEFLY },
//     { id: WalletId.PERA },
//     { id: WalletId.EXODUS },
//     // If you are interested in WalletConnect v2 provider
//     // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
//   ]
// }

// export default function App() {
//   const algodConfig = getAlgodConfigFromViteEnvironment()

//   const walletManager = new WalletManager({
//     wallets: supportedWallets,
//     defaultNetwork: algodConfig.network,
//     networks: {
//       [algodConfig.network]: {
//         algod: {
//           baseServer: algodConfig.server,
//           port: algodConfig.port,
//           token: String(algodConfig.token),
//         },
//       },
//     },
//     options: {
//       resetNetwork: true,
//     },
//   })

//   return (
//     <SnackbarProvider maxSnack={3}>
//       <WalletProvider manager={walletManager}>
//         <Home />
//       </WalletProvider>
//     </SnackbarProvider>
//   )
// }
