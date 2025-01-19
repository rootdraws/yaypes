const hre = require("hardhat");

async function main() {
  try {
    // Get the network
    const network = await hre.ethers.provider.getNetwork();
    console.log("Deploying to network:", network.name);
    
    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    console.log("Deploying TestNFT contract...");

    const TestNFT = await hre.ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy();
    
    console.log("Waiting for deployment...");
    await testNFT.waitForDeployment();

    const address = await testNFT.getAddress();
    console.log("TestNFT deployed to:", address);

    // Log initial NFT information
    const name = await testNFT.name();
    const symbol = await testNFT.symbol();
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log("10 NFTs have been minted to deployer address");

    // Verify the contract if not on localhost
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Waiting for block confirmations...");
      // Wait for 5 block confirmations
      await testNFT.deploymentTransaction().wait(5);
      
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
    }
  } catch (error) {
    console.error("Detailed error:");
    console.error(error);
    throw error;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("Deployment failed:");
  console.error(error);
  process.exitCode = 1;
}); 