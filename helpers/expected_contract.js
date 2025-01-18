import { ethers } from "ethers";

const getExpectedContractAddress = async (deployer, actionsAfter) => {
  const deployerAddress = await deployer.getAddress();
  const adminAddressTransactionCount = await deployer.getNonce();

  const expectedContractAddress = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: adminAddressTransactionCount + actionsAfter,
  });
 
  return expectedContractAddress;
};

export { getExpectedContractAddress }; 