const { ethers } = require('ethers');
const fs = require('fs');
const csv = require('csv-parse/sync');
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');

async function generateMerkleTree() {
    // Read the CSV file
    const fileContent = fs.readFileSync('YAYSnapshot.csv', 'utf-8');
    const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    // Format the data for the Merkle tree
    // Each leaf will be [address, amount]
    const leaves = records.map(record => {
        return [
            record.Address,
            ethers.parseEther(record.YAYReward.toString()) // Convert to wei
        ];
    });

    // Generate the Merkle tree
    const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);

    // Save the tree for later use
    fs.writeFileSync(
        "merkle-tree.json",
        JSON.stringify({
            tree: tree.dump(),
            values: leaves
        }, null, 2)
    );

    // Print the Merkle root
    console.log("Merkle Root:", tree.root);

    // Generate proof example for the first address
    if (leaves.length > 0) {
        const proof = tree.getProof(0);
        console.log("\nExample proof for first address:");
        console.log("Address:", leaves[0][0]);
        console.log("Amount:", leaves[0][1].toString());
        console.log("Proof:", proof);
    }

    return tree;
}

// Run the script
generateMerkleTree()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 