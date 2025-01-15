const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying YAY token...");
    
    const YAY = await ethers.getContractFactory("YAY");
    const yay = await YAY.deploy();
    await yay.deployed();
    
    console.log("YAY token deployed to:", yay.address);
    
    // Verify the deployment on Etherscan
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await yay.deployTransaction.wait(6);
        
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: yay.address,
            constructorArguments: [],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 