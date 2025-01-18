const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Basic ERC721 ABI - we only need balanceOf and tokenOfOwnerByIndex
const NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)"
];

async function getNFTHolders() {
    // Connect to Base network using environment variable
    const provider = new ethers.JsonRpcProvider(process.env.BASE_URL || "https://mainnet.base.org");
    
    // NFT Contract address from environment variable
    const NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
    if (!NFT_ADDRESS) {
        throw new Error("NFT_CONTRACT_ADDRESS not set in environment variables");
    }
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

    // Map to store holder data
    const holders = new Map();
    
    // Get MAX_TOKEN_ID from environment variable
    const MAX_TOKEN_ID = parseInt(process.env.MAX_TOKEN_ID || "10000");
    const batchSize = parseInt(process.env.BATCH_SIZE || "100");

    console.log("Starting to fetch NFT holders...");
    console.log(`Contract Address: ${NFT_ADDRESS}`);
    console.log(`Max Token ID: ${MAX_TOKEN_ID}`);
    console.log(`Batch Size: ${batchSize}`);

    // Batch our requests to avoid rate limiting
    for (let i = 1; i <= MAX_TOKEN_ID; i += batchSize) {
        const promises = [];
        
        for (let j = i; j < Math.min(i + batchSize, MAX_TOKEN_ID + 1); j++) {
            promises.push(
                nftContract.ownerOf(j)
                    .then(owner => {
                        holders.set(owner, (holders.get(owner) || 0) + 1);
                    })
                    .catch(() => {
                        // Skip if token doesn't exist or other errors
                    })
            );
        }

        await Promise.all(promises);
        console.log(`Processed tokens ${i} to ${Math.min(i + batchSize - 1, MAX_TOKEN_ID)}`);
    }

    // Convert to array and sort by number of NFTs held
    const holdersArray = Array.from(holders.entries()).map(([address, count]) => ({
        address,
        nftCount: count,
        yayReward: count // 1 YAY per NFT
    }));

    // Sort by NFT count (descending)
    holdersArray.sort((a, b) => b.nftCount - a.nftCount);

    // Save to CSV
    const csv = ['Address,NFT Count,YAY Reward'];
    holdersArray.forEach(holder => {
        csv.push(`${holder.address},${holder.nftCount},${holder.yayReward}`);
    });

    fs.writeFileSync('YAYSnapshot.csv', csv.join('\n'));

    // Print summary
    console.log(`Total unique holders: ${holders.size}`);
    console.log(`Total NFTs tracked: ${Array.from(holders.values()).reduce((a, b) => a + b, 0)}`);
    
    return holdersArray;
}

// Run the script
getNFTHolders()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });