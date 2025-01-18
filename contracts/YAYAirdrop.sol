// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YAYAirdrop is Ownable {
    IERC20 public immutable yayToken;
    IERC721 public constant NFT_CONTRACT = IERC721(0x53D8Cbfa0aBFeAB01ab5997827E67069C6b46C7a);
    uint256 public constant TOKENS_PER_NFT = 1 ether; // 1 YAY per NFT (18 decimals)

    event AirdropCompleted(uint256 startTokenId, uint256 endTokenId, uint256 totalDistributed);

    constructor(address _yayToken) Ownable(msg.sender) {
        yayToken = IERC20(_yayToken);
    }

    function airdrop(uint256 startTokenId, uint256 endTokenId) external onlyOwner {
        uint256 totalDistributed = 0;
        
        for (uint256 tokenId = startTokenId; tokenId <= endTokenId; tokenId++) {
            try NFT_CONTRACT.ownerOf(tokenId) returns (address owner) {
                if (owner != address(0)) {
                    require(yayToken.transfer(owner, TOKENS_PER_NFT), "Transfer failed");
                    totalDistributed += TOKENS_PER_NFT;
                }
            } catch {
                // Skip if token doesn't exist or other errors
                continue;
            }
        }

        emit AirdropCompleted(startTokenId, endTokenId, totalDistributed);
    }

    // Allow owner to withdraw any remaining tokens
    function withdraw() external onlyOwner {
        uint256 balance = yayToken.balanceOf(address(this));
        require(yayToken.transfer(owner(), balance), "Transfer failed");
    }
} 