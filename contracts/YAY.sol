// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC721Burnable is IERC721 {
    function burn(uint256 tokenId) external;
}

contract YAY is ERC20, Ownable {
    IERC721Burnable public constant NFT_CONTRACT = IERC721Burnable(0x53d8cbfa0abfeab01ab5997827e67069c6b46c7a);
    uint256 public constant REWARD_PER_BURN = 1 * 10 ** 18; // 1 YAY token with 18 decimals
    
    // Fixed allocations
    uint256 public constant TOTAL_SUPPLY = 40_000 * 10 ** 18;    // 40,000 YAY

    constructor() ERC20("YAY Token", "YAY") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function burnNFTForYAY(uint256 tokenId) external {
        require(NFT_CONTRACT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            NFT_CONTRACT.getApproved(tokenId) == address(this) || 
            NFT_CONTRACT.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        NFT_CONTRACT.burn(tokenId);
        require(transfer(msg.sender, REWARD_PER_BURN), "Transfer failed");
    }

    function batchBurnNFTForYAY(uint256[] calldata tokenIds) external {
        require(tokenIds.length <= 10, "Max 10 burns at once");
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            require(NFT_CONTRACT.ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            require(
                NFT_CONTRACT.getApproved(tokenIds[i]) == address(this) || 
                NFT_CONTRACT.isApprovedForAll(msg.sender, address(this)),
                "Not approved"
            );

            NFT_CONTRACT.burn(tokenIds[i]);
        }
        
        require(transfer(msg.sender, REWARD_PER_BURN * tokenIds.length), "Transfer failed");
    }
} 