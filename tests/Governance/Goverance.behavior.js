import { ethers } from "hardhat";
import { expect } from "chai";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";

export async function shouldBehaveLikeGovernor() {
    // ... rest of function remains the same ...
}

export async function shouldBehaveLikeGovernorWithTimestamp() {
    // ... rest of function remains the same ...
}

const eventLogs = (receipt?.logs ?? []).filter((log) => true); 