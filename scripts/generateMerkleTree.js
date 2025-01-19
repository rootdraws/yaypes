const { ethers } = require('ethers');
const fs = require('fs');
const csv = require('csv-parse/sync');
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');

async function generateMerkleTree() {
    // Read the CSV file using absolute path
    const fileContent = fs.readFileSync('/Users/kylejacobs/yaypes/YAYSnapshot.csv', 'utf-8');
    const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    // Log the first record to see the column names
    console.log("First record structure:", records[0]);

    // Format the data for the Merkle tree
    // Each leaf will be [address, amount]
    const leaves = records.map(record => {
        if (!record.Address || !record['YAY Reward']) {
            console.log("Problem record:", record);
            throw new Error("Invalid record structure");
        }
        return [
            record.Address,
            ethers.parseEther(record['YAY Reward'].toString()) // Use bracket notation for column with space
        ];
    });

    // Generate the Merkle tree
    const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);

    // Create a custom replacer function to handle BigInt
    const replacer = (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    };

    // Save the tree for later use
    fs.writeFileSync(
        "merkle-tree.json",
        JSON.stringify({
            tree: tree.dump(),
            values: leaves.map(leaf => [leaf[0], leaf[1].toString()]) // Convert BigInt to string
        }, replacer, 2)
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

    // Add a function to find an address and generate its proof
    const findAddressAndGenerateProof = (tree, targetAddress) => {
        for (const [i, v] of tree.entries()) {
            if (v[0].toLowerCase() === targetAddress.toLowerCase()) {
                const proof = tree.getProof(i);
                return {
                    address: v[0],
                    amount: v[1].toString(),
                    proof: proof
                };
            }
        }
        return null;
    };

    // Example usage:
    const targetAddress = "0x..."; // Replace with the address you want to generate a proof for
    const proofData = findAddressAndGenerateProof(tree, targetAddress);
    
    if (proofData) {
        console.log("\nProof for address:", targetAddress);
        console.log("Amount:", proofData.amount);
        console.log("Proof:", proofData.proof);
    } else {
        console.log("Address not found in the Merkle tree");
    }

    const verified = tree.verify(
        proofData.proof,
        [proofData.address, proofData.amount]
    );
    console.log("Proof verification:", verified);

    return tree;
}

// Run the script
generateMerkleTree()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 