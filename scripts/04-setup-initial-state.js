const { ethers } = require("hardhat");

async function main() {
    // Load environment variables
    const YAY_ADDRESS = process.env.YAY_ADDRESS;
    const AIRDROP_ADDRESS = process.env.AIRDROP_ADDRESS;
    const FARM_ADDRESS = process.env.FARM_ADDRESS;
    
    if (!YAY_ADDRESS || !AIRDROP_ADDRESS || !FARM_ADDRESS) {
        throw new Error("Required addresses not set in environment");
    }

    console.log("Setting up initial state...");

    // Get contract instances
    const yay = await ethers.getContractAt("YAY", YAY_ADDRESS);
    
    // Transfer tokens to airdrop contract (10,000 YAY)
    console.log("Transferring YAY to airdrop contract...");
    await yay.transfer(AIRDROP_ADDRESS, ethers.utils.parseEther("10000"));
    
    // Transfer tokens to farm contract (10,000 YAY)
    console.log("Transferring YAY to farm contract...");
    await yay.transfer(FARM_ADDRESS, ethers.utils.parseEther("10000"));
    
    console.log("Initial setup complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 