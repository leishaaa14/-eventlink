const { expect } = require('chai')
const { ethers }  = require('hardhat')

describe('EventRegistry', function () {
  let contract, owner, other

  const HASH    = 'a'.repeat(64)   // valid 64-char hex string
  const USER_ID = 'user_mongo_id_123'
  const EVT_ID  = 'event_mongo_id_456'

  beforeEach(async () => {
    ;[owner, other] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('EventRegistry')
    contract = await Factory.deploy()
  })

  it('registers a participant and emits event', async () => {
    await expect(contract.registerParticipant(HASH, USER_ID, EVT_ID))
      .to.emit(contract, 'Registered')
      .withArgs(HASH, USER_ID, EVT_ID, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1))
  })

  it('isRegistered returns true after registration', async () => {
    await contract.registerParticipant(HASH, USER_ID, EVT_ID)
    expect(await contract.isRegistered(HASH)).to.equal(true)
  })

  it('isRegistered returns false for unknown hash', async () => {
    expect(await contract.isRegistered('b'.repeat(64))).to.equal(false)
  })

  it('reverts on duplicate hash', async () => {
    await contract.registerParticipant(HASH, USER_ID, EVT_ID)
    await expect(contract.registerParticipant(HASH, USER_ID, EVT_ID))
      .to.be.revertedWith('EventRegistry: hash already registered')
  })

  it('reverts on invalid hash length', async () => {
    await expect(contract.registerParticipant('short', USER_ID, EVT_ID))
      .to.be.revertedWith('EventRegistry: invalid hash length')
  })

  it('getRegistration returns correct data', async () => {
    await contract.registerParticipant(HASH, USER_ID, EVT_ID)
    const [uid, eid] = await contract.getRegistration(HASH)
    expect(uid).to.equal(USER_ID)
    expect(eid).to.equal(EVT_ID)
  })

  it('totalRegistrations increments correctly', async () => {
    expect(await contract.totalRegistrations()).to.equal(0)
    await contract.registerParticipant(HASH, USER_ID, EVT_ID)
    expect(await contract.totalRegistrations()).to.equal(1)
  })

  it('only owner can pause', async () => {
    await expect(contract.connect(other).pause())
      .to.be.revertedWith('EventRegistry: not owner')
    await contract.pause()
    expect(await contract.paused()).to.equal(true)
  })

  it('blocks registration when paused', async () => {
    await contract.pause()
    await expect(contract.registerParticipant(HASH, USER_ID, EVT_ID))
      .to.be.revertedWith('EventRegistry: contract is paused')
  })

  it('unpauses correctly', async () => {
    await contract.pause()
    await contract.unpause()
    await expect(contract.registerParticipant(HASH, USER_ID, EVT_ID)).to.not.be.reverted
  })
})
