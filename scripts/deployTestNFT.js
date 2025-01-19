const hre = require("hardhat");

async function main() {
  console.log("Deploying TestNFT contract...");

  const TestNFT = await hre.ethers.getContractFactory("TestNFT");
  const testNFT = await TestNFT.deploy();
  await testNFT.waitForDeployment();

  const address = await testNFT.getAddress();
  console.log("TestNFT deployed to:", address);

  // Log initial NFT information
  const name = await testNFT.name();
  const symbol = await testNFT.symbol();
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log("10 NFTs have been minted to deployer address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 