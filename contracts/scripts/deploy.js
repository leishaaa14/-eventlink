const hre = require('hardhat')

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deploying with account:', deployer.address)
  console.log('Account balance:', (await hre.ethers.provider.getBalance(deployer.address)).toString())

  const EventRegistry = await hre.ethers.getContractFactory('EventRegistry')
  const contract      = await EventRegistry.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('\n✅ EventRegistry deployed to:', address)
  console.log('\nAdd this to your backend .env:')
  console.log(`CONTRACT_ADDRESS=${address}`)
}

main().catch(err => { console.error(err); process.exit(1) })
