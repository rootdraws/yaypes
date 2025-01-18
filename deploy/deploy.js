import { ethers } from 'hardhat';
import { config } from "../deploy.config.js" // Note: may need .js extension
import { getExpectedContractAddress } from '../helpers/expected_contract.js' // Note: may need .js extension
import fs from "fs";

const func = async function (hre) {
    console.log("\x1B[37mDeploying Open Zepellin Governance contracts");

    const CONFIG = {
        token: {
            name: "YAYPES",
            symbol: "YAY",
            nftContract: "0x..."  // Add NFT contract address here
        },
        timelock: {
            minDelay: 60, // 12 minutes (assuming 12 seconds per block)
        },
        clockMode: false,
        governor: {
            name: "YAYPES DAO",
            votingDelay: 50, // ~10 minutes (assuming 12 seconds per block)
            votingPeriod: 100, // ~20 minutes (assuming 12 seconds per block)
            quorumNumerator: 4,
            proposalThreshold: 1,
            voteExtension: 50, // ~10 minutes (assuming 12 seconds per block)
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

    // Load values for constructor
    const governance_address = await getExpectedContractAddress(deployerSigner, 2);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
    const token_address = await getExpectedContractAddress(deployerSigner, 0);

    const admin_address = governance_address;
    const minter = deployer;

    console.log("Future contract addresses")
    console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
    console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m")
    console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m\n")

    console.log("ClockMode will use ", CONFIG.clockMode ? "timestamp" : "block number", " as time unit\n")

    //// deploy token
    await (async function deployToken() {
        let token;
        const args = [
            CONFIG.token.name,
            CONFIG.token.symbol,
            admin_address,           // defaultAdmin - using existing admin_address variable
            CONFIG.token.nftContract // NFT contract address
        ]

        token = await deploy("ERC20Token", {
            from: deployer,
            contract: CONFIG.clockMode ? "contracts/clock/ERC20Token.sol:ERC20Token" : "contracts/ERC20Token.sol:ERC20Token",
            args: args,
            log: true,
        });

        const tdBlock = await hre.ethers.provider.getBlock("latest");
    })();

    //// deploy timelock
    await (async function deployTimelock() {
        const proposers = [admin_address, timelock_address];
        const executors = [admin_address, timelock_address];
    })();

    //// deploy governor
    await (async function deployGovernor() {
        let governor;
        const args = [
            CONFIG.governor.name,
            token_address,
            timelock_address,
            CONFIG.governor.votingDelay,
            CONFIG.governor.votingPeriod,
            CONFIG.governor.proposalThreshold,
            CONFIG.governor.quorumNumerator,
            CONFIG.governor.voteExtension
        ]
    })();
};

func.id = "deploy_governor"; // id required to prevent reexecution
func.tags = ["ERC20","GOVERNOR","TIMELOCK"];

export default func; 