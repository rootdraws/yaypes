const fs = require('fs');
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');

function getProofForAddress(address) {
    // Read the merkle-tree.json file
    const merkleData = JSON.parse(fs.readFileSync('./merkle-tree.json', 'utf8'));
    
    // Reconstruct the Merkle tree
    const tree = StandardMerkleTree.load(merkleData.tree);
    
    // Find the user's data
    const values = merkleData.values;
    const userIndex = values.findIndex(([addr]) => 
        addr.toLowerCase() === address.toLowerCase()
    );
    
    if (userIndex === -1) {
        console.log('Address not found in the merkle tree');
        return null;
    }

    // Get the user's data
    const userData = values[userIndex];
    const [userAddress, amount] = userData;

    // Get the proof using the StandardMerkleTree
    const proof = tree.getProof(userIndex);

    return {
        address: userAddress,
        amount: amount,
        proof: proof
    };
}

// Example usage:
const userAddress = process.argv[2]; // Get address from command line argument
if (!userAddress) {
    console.log('Please provide an address as an argument');
    console.log('Example: node getProof.js 0x123...');
    process.exit(1);
}

const proofData = getProofForAddress(userAddress);
if (proofData) {
    console.log('\nProof data for address:', proofData.address);
    console.log('Amount:', proofData.amount);
    console.log('Proof:', proofData.proof);
} 