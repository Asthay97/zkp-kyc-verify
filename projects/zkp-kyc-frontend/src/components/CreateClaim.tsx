import React, { useState } from 'react'

interface CreateClaimProps {
  openModal: boolean
  closeModal: () => void
  issuerDID: string
}

const CreateClaim: React.FC<CreateClaimProps> = ({ openModal, closeModal, issuerDID }) => {
  const [schema, setSchema] = useState('KYC Basic')
  const [expiration, setExpiration] = useState('')
  const [dob, setDob] = useState('')
  const [docType, setDocType] = useState('Passport')
  const [proverDID, setProverDID] = useState('')

  if (!openModal) return null

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create Claim</h2>

        <label className="block text-left">Schema:</label>
        <select className="w-full p-2 border rounded mb-3" value={schema} onChange={(e) => setSchema(e.target.value)}>
          <option>KYC Basic</option>
          <option>KYC Advanced</option>
        </select>

        <label className="block text-left">Expiration:</label>
        <input type="date" className="w-full p-2 border rounded mb-3" value={expiration} onChange={(e) => setExpiration(e.target.value)} />

        <label className="block text-left">Date of Birth:</label>
        <input type="date" className="w-full p-2 border rounded mb-3" value={dob} onChange={(e) => setDob(e.target.value)} />

        <label className="block text-left">Document Type:</label>
        <select className="w-full p-2 border rounded mb-3" value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option>Passport</option>
          <option>Driving License</option>
          <option>ID Card</option>
        </select>

        <label className="block text-left">Prover DID:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-3"
          placeholder="Enter Prover DID"
          value={proverDID}
          onChange={(e) => setProverDID(e.target.value)}
        />

        <label className="block text-left">Issuer DID:</label>
        <input type="text" className="w-full p-2 border rounded mb-3" value={issuerDID} readOnly />

        <div className="flex justify-between">
          <button className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn btn-primary">Submit</button>
        </div>
      </div>
    </div>
  )
}

export default CreateClaim
