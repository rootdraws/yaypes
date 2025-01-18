const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const YAYFarm = await ethers.getContractFactory("YAYFarm");

  // Get the YAY token and LP token addresses
  // Replace these addresses with your actual token addresses
  const yayTokenAddress = "YOUR_YAY_TOKEN_ADDRESS";
  const lpTokenAddress = "YOUR_LP_TOKEN_ADDRESS";
  
  // Set YAY tokens per block (e.g., 1 YAY per block = 1e18)
  const yayPerBlock = ethers.parseEther("1.0");

  console.log("Deploying YAYFarm...");
  
  // Deploy the contract
  const farm = await YAYFarm.deploy(
    yayTokenAddress,
    lpTokenAddress,
    yayPerBlock
  );

  await farm.waitForDeployment();
  
  const farmAddress = await farm.getAddress();
  console.log("YAYFarm deployed to:", farmAddress);

  // Verify on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await farm.deployTransaction.wait(6); // Wait for 6 block confirmations

    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: farmAddress,
      constructorArguments: [
        yayTokenAddress,
        lpTokenAddress,
        yayPerBlock,
      ],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 