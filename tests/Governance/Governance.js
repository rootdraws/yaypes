const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployGovernanceContractsClockTimestampFixture, deployGovernanceContractsFixture } = require("./Governance.fixture");
const { shouldBehaveLikeGovernor, shouldBehaveLikeGovernorWithTimestamp } = require("./Goverance.behavior");

describe("OZGovernor", function () {
  before(async function () {
    this.signers = {};

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.notAuthorized = signers[1];    

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {   
    const { token, timelock, governor } = await this.loadFixture(deployGovernanceContractsFixture);
    this.governor = governor;
    this.token = token;
    this.timelock = timelock;
  });

  shouldBehaveLikeGovernor();
});

describe("OZGovernorTimestamp", function () {
  before(async function () {
    this.signers = {};

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.notAuthorized = signers[1];    

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {   
    const { token, timelock, governor } = await this.loadFixture(deployGovernanceContractsClockTimestampFixture);
    this.governor = governor;
    this.token = token;
    this.timelock = timelock;
  });

  shouldBehaveLikeGovernorWithTimestamp();
}); 