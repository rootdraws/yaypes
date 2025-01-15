const { ethers } = require("hardhat");

async function main() {
    // Get the necessary addresses - replace with actual addresses after deployment
    const YAY_ADDRESS = process.env.YAY_ADDRESS;
    const LP_TOKEN_ADDRESS = process.env.LP_TOKEN_ADDRESS;
    const YAY_PER_BLOCK = ethers.utils.parseEther("1"); // 1 YAY per block, adjust as needed

    if (!YAY_ADDRESS || !LP_TOKEN_ADDRESS) {
        throw new Error("YAY_ADDRESS or LP_TOKEN_ADDRESS not set in environment");
    }

    console.log("Deploying YAYFarm...");
    
    const YAYFarm = await ethers.getContractFactory("YAYFarm");
    const farm = await YAYFarm.deploy(
        YAY_ADDRESS,
        LP_TOKEN_ADDRESS,
        YAY_PER_BLOCK
    );
    await farm.deployed();
    
    console.log("YAYFarm deployed to:", farm.address);

    // Verify the deployment on Etherscan
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await farm.deployTransaction.wait(6);
        
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: farm.address,
            constructorArguments: [
                YAY_ADDRESS,
                LP_TOKEN_ADDRESS,
                YAY_PER_BLOCK
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