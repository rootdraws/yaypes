require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("hardhat-gas-reporter");

/*
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS [CONSTRUCTOR_ARGUMENTS]
# or
npx hardhat verify --network base-sepolia YOUR_CONTRACT_ADDRESS [CONSTRUCTOR_ARGUMENTS]
*/

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const chainIds = {
  hardhat: 31337,
  base: 8453,
  "base-sepolia": 84532,
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  sourcify: {
    enabled: true
  },
  solidity: {
    compilers: [
      {
        version: "0.8.28",
      },
      {
        version: "0.8.20",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
    },
    base: {
      url: process.env.BASE_URL || "https://mainnet.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
      timeout: 60000,
      gasPrice: "auto",
      gas: "auto"
    },
    "base-sepolia": {
      url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
      timeout: 60000,
      gasPrice: "auto",
      gas: "auto"
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_KEY || "",
      "base-sepolia": process.env.BASESCAN_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      }
    ]
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
  }
};
