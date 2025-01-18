const { task } = require("hardhat/config");
const { getExpectedContractAddress } = require('../../helpers/expected_contract');

task('expected_contract', "next contract expected address, use 2 if you're deploying a timelock")
    .addParam("number", "number of transactions after current nonce.")
    .setAction(async function ({number}, {ethers, network}) {
        console.log("Getting the expected number for future deploy");

        // const signer = await ethers.getSigner();
        const signers = await ethers.getSigners();
        const signer = signers[0];

        // HARDHAT LOG
        console.log(
            `network:\x1B[36m${network.name}\x1B[37m`,
            `\nsigner:\x1B[33m${await signer.getAddress()}\x1B[37m\n`
        );

        // INFO LOGS
        console.log("number:\x1B[33m", number, "\x1B[37m\n");

        // EXPECTED CONTRACT
        const admin_address = await getExpectedContractAddress(signer, number);
        
        console.log(`Expected contract will be: \x1B[33m${admin_address}\x1B[37m\n`)
    }); 