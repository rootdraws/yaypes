const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const YAYFarm = await ethers.getContractFactory("YAYFarm");

  // Get the YAY token and LP token addresses
  // These should be actual addresses - don't deploy without them
  const yayTokenAddress = process.env.YAY_TOKEN_ADDRESS;
  const lpTokenAddress = process.env.LP_TOKEN_ADDRESS;
  
  // Validate addresses
  if (!yayTokenAddress || !lpTokenAddress) {
    throw new Error("YAY_TOKEN_ADDRESS and LP_TOKEN_ADDRESS must be set in environment variables");
  }

  // Set YAY tokens per block (should come from config or env)
  const yayPerBlock = ethers.parseEther(process.env.YAY_PER_BLOCK || "1.0");

  // Verify LP token has supply before deploying
  const lpToken = await ethers.getContractAt("IERC20", lpTokenAddress);
  const lpSupply = await lpToken.totalSupply();
  if (lpSupply === 0n) {
    throw new Error("LP token has no supply. Deploy after LP token is initialized.");
  }

  console.log("Deploying YAYFarm...");
  console.log("YAY Token:", yayTokenAddress);
  console.log("LP Token:", lpTokenAddress);
  console.log("YAY Per Block:", ethers.formatEther(yayPerBlock));
  
  // Deploy the contract
  const farm = await YAYFarm.deploy(
    yayTokenAddress,
    lpTokenAddress,
    yayPerBlock
  );

  await farm.waitForDeployment();
  
  const farmAddress = await farm.getAddress();
  console.log("YAYFarm deployed to:", farmAddress);

  // Verify on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    // Modern ethers.js doesn't use deployTransaction, we wait on the contract
    await farm.deploymentTransaction().wait(6); // Wait for 6 block confirmations

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