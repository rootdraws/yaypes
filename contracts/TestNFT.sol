// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("TestNFT", "TNFT") Ownable(msg.sender) {
        // Mint 10 NFTs to the deployer
        for(uint256 i = 0; i < 10; i++) {
            _safeMint(msg.sender, _nextTokenId);
            _nextTokenId++;
        }
    }

    function mint(address to) public onlyOwner {
        _safeMint(to, _nextTokenId);
        _nextTokenId++;
    }
}
