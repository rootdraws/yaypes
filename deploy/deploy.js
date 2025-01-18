import { ethers } from 'hardhat';
import { config } from "../deploy.config.js" // Note: may need .js extension
import { getExpectedContractAddress } from '../helpers/expected_contract.js' // Note: may need .js extension
import fs from "fs";

/*
1. Deploy YAYFarm (with placeholder YAY address)
2. Deploy ERC20Token (using YAYFarm address)
3. Update YAYFarm's YAY token address
4. Deploy YAYSnapshot
*/

const func = async function (hre) {
    console.log("\x1B[37mDeploying Open Zepellin Governance contracts");

    const CONFIG = {
        token: {
            name: "YAYPES",
            symbol: "YAY",
            nftContract: process.env.NFT_CONTRACT_ADDRESS  // Updated to use env variable
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
        const proposers = [governance_address]; // Governor will be proposer
        const executors = [ethers.ZeroAddress]; // Anyone can execute
        const admin = deployer; // Initial admin for setup
        
        await deploy("TimelockController", {
            from: deployer,
            args: [
                CONFIG.timelock.minDelay,
                proposers,
                executors,
                admin
            ],
            log: true,
        });
    });

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
        ];

        governor = await deploy("OZGovernor", {
            from: deployer,
            args: args,
            log: true,
        });
    });

    async function setupGovernance() {
        const timelock = await ethers.getContract("TimelockController");
        const governor = await ethers.getContract("OZGovernor");
        const token = await ethers.getContract("ERC20Token");
        
        console.log("\nSetting up governance roles and permissions...");

        // Transfer ERC20Token admin control to timelock
        await token.transferAdminControl(timelock.address);
        console.log(`Transferred ERC20Token admin control to Timelock at ${timelock.address}`);
        
        // Grant proposer role to Governor
        const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
        await timelock.grantRole(PROPOSER_ROLE, governor.address);
        console.log(`Granted PROPOSER_ROLE to Governor at ${governor.address}`);
        
        // Optional: Verify executor role is open (address(0))
        const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
        const isExecutorRoleOpen = await timelock.hasRole(EXECUTOR_ROLE, ethers.ZeroAddress);
        console.log(`Executor role is ${isExecutorRoleOpen ? 'open to everyone' : 'restricted'}`);
        
        // Revoke admin role from deployer
        const ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
        await timelock.revokeRole(ADMIN_ROLE, deployer);
        console.log(`Revoked DEFAULT_ADMIN_ROLE from deployer ${deployer}`);

        // Verify setup
        console.log("\nVerifying governance setup:");
        console.log(`- Governor has proposer role: ${await timelock.hasRole(PROPOSER_ROLE, governor.address)}`);
        console.log(`- Deployer no longer has admin role: ${!await timelock.hasRole(ADMIN_ROLE, deployer)}`);
        console.log(`- Timelock is admin of itself: ${await timelock.hasRole(ADMIN_ROLE, timelock.address)}`);
    }

    await setupGovernance();
};

func.id = "deploy_governor"; // id required to prevent reexecution
func.tags = ["ERC20","GOVERNOR","TIMELOCK"];

export default func; 