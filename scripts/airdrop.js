const { ethers } = require("hardhat");

async function main() {
    // Get the YAY token address after deploying YAY token
    const YAY_TOKEN_ADDRESS = "YOUR_YAY_TOKEN_ADDRESS";
    
    // Deploy the airdrop contract
    const YAYAirdrop = await ethers.getContractFactory("YAYAirdrop");
    const airdrop = await YAYAirdrop.deploy(YAY_TOKEN_ADDRESS);
    await airdrop.deployed();
    
    console.log("YAYAirdrop deployed to:", airdrop.address);

    // Transfer YAY tokens to the airdrop contract
    const yayToken = await ethers.getContractAt("YAY", YAY_TOKEN_ADDRESS);
    const transferAmount = ethers.utils.parseEther("1000"); // Adjust based on number of NFTs
    await yayToken.transfer(airdrop.address, transferAmount);

    // Execute airdrop in batches of 30
    const BATCH_SIZE = 30;
    const MAX_TOKEN_ID = 10000; // Adjust this based on your NFT collection size
    
    for (let startTokenId = 0; startTokenId < MAX_TOKEN_ID; startTokenId += BATCH_SIZE) {
        const endTokenId = Math.min(startTokenId + BATCH_SIZE - 1, MAX_TOKEN_ID - 1);
        console.log(`Airdropping to tokens ${startTokenId} - ${endTokenId}`);
        
        const tx = await airdrop.airdrop(startTokenId, endTokenId);
        await tx.wait();
        
        console.log(`Batch completed. Transaction hash: ${tx.hash}`);
        
        // Optional: Add a small delay between batches
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 