# YAY Deployment

## Deployment process

1. Set up your .env file with your private key
2. Run npx hardhat run scripts/01-deploy-yay.js --network base-sepolia
3. Add YAY_ADDRESS to .env
4. Create LP token on Base Sepolia (using UniswapV2)
5. Add LP_TOKEN_ADDRESS to .env
6. Run npx hardhat run scripts/02-deploy-airdrop.js --network base-sepolia
7. Add AIRDROP_ADDRESS to .env
8. Run npx hardhat run scripts/03-deploy-farm.js --network base-sepolia
9. Add FARM_ADDRESS to .env
10. Run npx hardhat run scripts/04-setup-initial-state.js --network base-sepolia
