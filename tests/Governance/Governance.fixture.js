const { ethers } = require("hardhat");

const { getExpectedContractAddress } = require("../../../helpers/expected_contract");
const { config } = require("../../deploy.config");

async function deployGovernanceContractsFixture() {
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];

    // Load values for constructor from a ts file deploy.config.ts
    const governance_address = await getExpectedContractAddress(deployerSigner, 2);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
    const token_address = await getExpectedContractAddress(deployerSigner, 0);

    const admin_address = governance_address;

    // TOKEN CONTRACT
    const GovernorToken = await ethers.getContractFactory("contracts/ERC20Token.sol:ERC20Token");
    const token = await GovernorToken.connect(deployerSigner).deploy(
        config.token.name,
        config.token.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // TIMELOCK CONTRACT
    const TimelockController = await ethers.getContractFactory("contracts/TimelockController.sol:TimelockController");
    const timelock = await TimelockController.connect(deployerSigner).deploy(
        config.timelock.minDelay,
        [admin_address, timelock_address],
        [admin_address, timelock_address],
        timelock_address,
    );

    // GOVERNOR CONTRACT
    const OZGovernor = await ethers.getContractFactory("contracts/OZGovernor.sol:OZGovernor");
    const governor = await OZGovernor.connect(deployerSigner).deploy(
        config.governor.name,
        token_address,
        timelock_address,
        config.governor.votingDelay,
        config.governor.votingPeriod,
        config.governor.proposalThreshold,
        config.governor.quorumNumerator,
        config.governor.voteExtension,
    );

    return { token, timelock, governor };
}

async function deployGovernanceContractsClockTimestampFixture() {
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];

    // Load values for constructor from a ts file deploy.config.ts
    const governance_address = await getExpectedContractAddress(deployerSigner, 2);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
    const token_address = await getExpectedContractAddress(deployerSigner, 0);

    const admin_address = governance_address;

    // TOKEN CONTRACT
    const GovernorToken = await ethers.getContractFactory("contracts/clock/ERC20Token.sol:ERC20Token");
    const token = await GovernorToken.connect(deployerSigner).deploy(
        config.token.name,
        config.token.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // TIMELOCK CONTRACT
    const TimelockController = await ethers.getContractFactory("contracts/TimelockController.sol:TimelockController");
    const timelock = await TimelockController.connect(deployerSigner).deploy(
        config.timelock.minDelay,
        [admin_address, timelock_address],
        [admin_address, timelock_address],
        timelock_address,
    );

    // GOVERNOR CONTRACT
    const OZGovernor = await ethers.getContractFactory("contracts/clock/OZGovernor.sol:OZGovernor");
    const governor = await OZGovernor.connect(deployerSigner).deploy(
        config.governor.name,
        token_address,
        timelock_address,
        config.governor.votingDelay,
        config.governor.votingPeriod,
        config.governor.proposalThreshold,
        config.governor.quorumNumerator,
        config.governor.voteExtension,
    );

    return { token, timelock, governor };
}

module.exports = {
    deployGovernanceContractsFixture,
    deployGovernanceContractsClockTimestampFixture
}; 