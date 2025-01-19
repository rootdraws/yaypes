const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Basic ERC721 ABI - we only need balanceOf and tokenOfOwnerByIndex
const NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)"
];

async function retryOwnerOf(nftContract, tokenId, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const owner = await nftContract.ownerOf(tokenId);
            return owner;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            // Wait longer between each retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

async function getNFTHolders() {
    // Connect to Base network using environment variable
    const provider = new ethers.JsonRpcProvider(process.env.BASE_URL || "https://mainnet.base.org");
    
    // NFT Contract address from environment variable
    const NFT_ADDRESS = "0x53D8Cbfa0aBFeAB01ab5997827E67069C6b46C7a";
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

    // Get actual total supply and convert to number
    const totalSupply = Number(await nftContract.totalSupply());
    console.log(`Total Supply: ${totalSupply}`);

    // Map to store holder data
    const holders = new Map();
    
    const batchSize = 50; // Reduced batch size to avoid rate limiting

    console.log("Starting to fetch NFT holders...");
    console.log(`Contract Address: ${NFT_ADDRESS}`);

    // Start from 1 instead of 0
    for (let i = 1; i <= totalSupply; i += batchSize) {
        const promises = [];
        
        for (let j = i; j < Math.min(i + batchSize, totalSupply + 1); j++) {
            promises.push(
                retryOwnerOf(nftContract, j)
                    .then(owner => {
                        holders.set(owner, (holders.get(owner) || 0) + 1);
                    })
                    .catch((error) => {
                        console.error(`Failed to fetch owner of token ${j} after retries:`, error.message);
                    })
            );
        }

        await Promise.all(promises);
        console.log(`Processed tokens ${i} to ${Math.min(i + batchSize - 1, totalSupply)}`);
        
        // Increased delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        console.error("Fatal error:", error);
        process.exit(1);
    });