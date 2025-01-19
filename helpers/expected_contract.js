const { ethers } = require("ethers");

async function getExpectedContractAddress(signer, offset = 0) {
    const nonce = await signer.getNonce();
    const futureAddress = ethers.getCreateAddress({
        from: await signer.getAddress(),
        nonce: nonce + offset
    });
    return futureAddress;
}

module.exports = {
    getExpectedContractAddress
}; 