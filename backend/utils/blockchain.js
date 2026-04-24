const { ethers } = require('ethers')

// Minimal ABI — only the functions we call from the backend
const ABI = [
  'function registerParticipant(string qrHash, string userId, string eventId) external',
  'function isRegistered(string qrHash) external view returns (bool)',
  'event Registered(string indexed qrHash, string userId, string eventId, uint256 timestamp)',
]

let contract = null

function getContract() {
  if (contract) return contract

  if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
    throw new Error('Blockchain env vars (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS) not set')
  }

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
  const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  contract       = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet)
  return contract
}

/**
 * Write a registration record to the Ethereum smart contract
 * @param {string} qrHash  - SHA-256 hash of the QR code
 * @param {string} userId  - MongoDB user ID (as string)
 * @param {string} eventId - MongoDB event ID (as string)
 * @returns {ethers.TransactionResponse}
 */
exports.writeRegistrationToChain = async (qrHash, userId, eventId) => {
  const c  = getContract()
  const tx = await c.registerParticipant(qrHash, userId, eventId)
  await tx.wait(1)   // wait for 1 block confirmation
  return tx
}

/**
 * Check if a QR hash is already recorded on-chain
 * @param {string} qrHash
 * @returns {boolean}
 */
exports.isOnChain = async (qrHash) => {
  const c = getContract()
  return c.isRegistered(qrHash)
}
