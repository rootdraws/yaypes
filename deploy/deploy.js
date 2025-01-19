const { ethers } = require('hardhat');

const func = async function (hre) {
    console.log("\x1B[37mDeploying ERC20Token contract");

    const CONFIG = {
        token: {
            name: "YAYPES",
            symbol: "YAY",
            nftContract: process.env.NFT_CONTRACT_ADDRESS
        }
    };

    // DEPLOY
    const { deploy } = hre.deployments;
    const [deployerSigner] = await hre.ethers.getSigners();
    const deployer = await deployerSigner.getAddress();

    // HARDHAT LOG
    console.log(
        `network:\x1B[36m${hre.network.name}\x1B[37m`,
        `\nsigner:\x1B[33m${deployer}\x1B[37m\n`
    );

    // Deploy Token with deployer as admin
    const token = await deploy("ERC20Token", {
        from: deployer,
        args: [
            CONFIG.token.name,
            CONFIG.token.symbol,
            deployer,           // admin is deployer
            CONFIG.token.nftContract
        ],
        log: true,
    });

    console.log("\nDeployed contract address:");
    console.log(`Token:     ${token.address}`);
};

func.id = "deploy_token";
func.tags = ["ERC20"];

module.exports = func; 