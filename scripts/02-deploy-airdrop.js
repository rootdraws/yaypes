const { ethers } = require("hardhat");

async function main() {
    // Get the YAY token address - replace with actual address after deployment
    const YAY_ADDRESS = process.env.YAY_ADDRESS;
    if (!YAY_ADDRESS) {
        throw new Error("YAY_ADDRESS not set in environment");
    }

    console.log("Deploying YAYAirdrop...");
    
    const YAYAirdrop = await ethers.getContractFactory("YAYAirdrop");
    const airdrop = await YAYAirdrop.deploy(YAY_ADDRESS);
    await airdrop.deployed();
    
    console.log("YAYAirdrop deployed to:", airdrop.address);

    // Verify the deployment on Etherscan
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await airdrop.deployTransaction.wait(6);
        
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: airdrop.address,
            constructorArguments: [YAY_ADDRESS],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 