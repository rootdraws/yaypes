// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title ERC20Token
 * @dev ERC20Token with burning, access control, and NFT interaction capabilities
 */
contract ERC20Token is ERC20, ERC20Burnable, AccessControl, ERC20Permit, ERC20Votes {
    ERC721Burnable public immutable NFT_CONTRACT;
    
    uint256 private constant DECIMALS = 18;
    uint256 public constant REWARD_PER_BURN = 1 * 10 ** DECIMALS;
    uint256 public constant TOTAL_SUPPLY = 40_000 * 10 ** DECIMALS;
    uint256 public constant MAX_ALTAR_OFFERINGS = 8;
    uint256 private constant ALLOCATION_AMOUNT = 10_000 * 10 ** DECIMALS;

    mapping(address => uint256[]) public altarOfferings;
    mapping(uint256 => address) public tokenIdToAltarAddress;
    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimedAirdrop;
    mapping(address => uint256) public pendingRewards;
    mapping(address => bool) public hasUnclaimedRewards;

    event EnlightenmentCalculated(address indexed user, uint256 burnCount, uint256 rewardAmount);
    event EnlightenmentClaimed(address indexed user, uint256 burnCount, uint256 rewardAmount);
    event TokensPlacedOnAltar(address indexed user, uint256[] tokenIds);
    event MerkleRootSet(bytes32 merkleRoot);
    event AirdropClaimed(address indexed user, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        address defaultAdmin,
        address nftContract
    )
        ERC20(_name, _symbol)
        ERC20Permit(_name)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        NFT_CONTRACT = ERC721Burnable(nftContract);
        _mint(address(this), TOTAL_SUPPLY);
    }

    function initialize(address yayFarmAddress, address daoAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(transfer(yayFarmAddress, ALLOCATION_AMOUNT), "YAYFarm transfer failed");
        require(transfer(daoAddress, ALLOCATION_AMOUNT), "DAO transfer failed");
    }

    function placeOnAltar(uint256[] calldata tokenIds) external {
        require(tokenIds.length <= MAX_ALTAR_OFFERINGS, "Max 8 tokens");
        cleanupAltarData();
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            require(NFT_CONTRACT.ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            tokenIdToAltarAddress[tokenIds[i]] = msg.sender;
        }
        
        altarOfferings[msg.sender] = tokenIds;
        emit TokensPlacedOnAltar(msg.sender, tokenIds);
    }

    function meditate() external returns (uint256) {
        require(!hasUnclaimedRewards[msg.sender], "Must claim enlightenment first");
        uint256[] storage tokenIds = altarOfferings[msg.sender];
        require(tokenIds.length > 0, "No offerings found");
        
        uint256 validBurns;
        for(uint256 i = 0; i < tokenIds.length; i++) {
            if (!_isTokenOwned(tokenIds[i])) validBurns++;
        }
        
        uint256 rewardAmount = validBurns * REWARD_PER_BURN;
        if (rewardAmount > 0) {
            pendingRewards[msg.sender] = rewardAmount;
            hasUnclaimedRewards[msg.sender] = true;
            emit EnlightenmentCalculated(msg.sender, validBurns, rewardAmount);
        }
        
        cleanupAltarData();
        return rewardAmount;
    }

    function claimBurnRewards() external {
        require(hasUnclaimedRewards[msg.sender], "No rewards to claim");
        uint256 rewardAmount = pendingRewards[msg.sender];
        
        hasUnclaimedRewards[msg.sender] = false;
        pendingRewards[msg.sender] = 0;
        
        require(transfer(msg.sender, rewardAmount), "Transfer failed");
        emit EnlightenmentClaimed(msg.sender, rewardAmount / REWARD_PER_BURN, rewardAmount);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyRole(DEFAULT_ADMIN_ROLE) {
        merkleRoot = _merkleRoot;
        emit MerkleRootSet(_merkleRoot);
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimedAirdrop[msg.sender], "Already claimed airdrop");
        bytes32 node = keccak256(abi.encode(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "Invalid proof");

        hasClaimedAirdrop[msg.sender] = true;
        require(transfer(msg.sender, amount), "Transfer failed");
        emit AirdropClaimed(msg.sender, amount);
    }

    function transferAdminControl(address timelock) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(timelock != address(0), "Cannot transfer to zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, timelock);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function cleanupAltarData() internal {
        uint256[] storage tokenIds = altarOfferings[msg.sender];
        for(uint256 i = 0; i < tokenIds.length; i++) {
            delete tokenIdToAltarAddress[tokenIds[i]];
        }
        delete altarOfferings[msg.sender];
    }

    function _isTokenOwned(uint256 tokenId) private view returns (bool) {
        try NFT_CONTRACT.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}

