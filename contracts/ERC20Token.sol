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
 * @dev ERC20Token is an ERC20 token with additional features such as burning, pausing, and minting,
 * along with AccessControl and Permit functionalities.
 * 
 * @notice Setup Process:
 * 1. Call initializeYAYFarm() to allocate 10,000 tokens to YAYFarm contract
 * 2. Call initializeDAO() to allocate 10,000 tokens to DAO treasury
 * 3. Call setMerkleRoot() with airdrop merkle root
 * 4. Call transferAdminControl() to transfer ownership to timelock controller
 */
contract ERC20Token is ERC20, ERC20Burnable, AccessControl, ERC20Permit, ERC20Votes {
    ERC721Burnable public immutable NFT_CONTRACT;
    uint256 public constant REWARD_PER_BURN = 1 * 10 ** 18; // 1 token with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 40_000 * 10 ** 18;    // 40,000 tokens - fixed cap
    uint256 public constant MAX_ALTAR_OFFERINGS = 8; // Maximum NFTs that can be placed on altar at once

    // Maps user address to their token IDs on the altar
    mapping(address => uint256[]) public altarOfferings;
    // Maps token ID to the address that placed it on the altar
    mapping(uint256 => address) public tokenIdToAltarAddress;

    // Add new airdrop-related state variables
    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimedAirdrop;

    // Events
    event TokensPlacedOnAltar(address indexed user, uint256[] tokenIds);
    event BurnRewardsClaimed(address indexed user, uint256 burnCount, uint256 rewardAmount);
    event AirdropClaimed(address indexed account, uint256 amount);
    event MerkleRootSet(bytes32 merkleRoot);

    /**
     * @dev Initializes the ERC20Token contract.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param defaultAdmin The default admin role holder.
     * @param nftContract The address of the NFT contract.
     */
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

    /**
     * @notice Initializes the YAYFarm with its token allocation
     * @param yayFarmAddress The address of the YAYFarm contract
     */
    function initializeYAYFarm(address yayFarmAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 farmAllocation = 10_000 * 10 ** 18;
        require(transfer(yayFarmAddress, farmAllocation), "Transfer failed");
    }

    /**
     * @notice Initializes the DAO with its token allocation for protocol-owned liquidity
     * @param daoAddress The address of the DAO treasury
     */
    function initializeDAO(address daoAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 daoAllocation = 10_000 * 10 ** 18;
        require(transfer(daoAddress, daoAllocation), "Transfer failed");
    }

    /**
     * @notice Place NFTs on the altar for future burning
     * @param tokenIds Array of token IDs to place on altar (max 8)
     */
    function placeOnAltar(uint256[] calldata tokenIds) external {
        require(tokenIds.length <= MAX_ALTAR_OFFERINGS, "Max 8 tokens");
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            require(NFT_CONTRACT.ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            
            // Handle existing altar registrations
            address currentAltarOwner = tokenIdToAltarAddress[tokenIds[i]];
            if(currentAltarOwner != address(0) && currentAltarOwner != msg.sender) {
                removeTokenFromAltar(currentAltarOwner, tokenIds[i]);
            }
            
            tokenIdToAltarAddress[tokenIds[i]] = msg.sender;
        }
        
        altarOfferings[msg.sender] = tokenIds;
        emit TokensPlacedOnAltar(msg.sender, tokenIds);
    }

    /**
     * @notice Claim YAY tokens for burned NFTs
     */
    function claimYAYForBurnedNFTs() external {
        uint256[] storage tokenIds = altarOfferings[msg.sender];
        require(tokenIds.length > 0, "No offerings found");
        
        uint256 validBurns = 0;
        
        // Count valid burns and verify ownership
        for(uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            try NFT_CONTRACT.ownerOf(tokenId) returns (address currentOwner) {
                // Token exists - must still be owned by claimer
                if(currentOwner != msg.sender) {
                    // Token was transferred - will be cleaned up
                    continue;
                }
            } catch {
                // Token doesn't exist (burned) - count it
                validBurns++;
            }
        }
        
        // Clean up ALL altar data for this user
        for(uint256 i = 0; i < tokenIds.length; i++) {
            delete tokenIdToAltarAddress[tokenIds[i]];
        }
        delete altarOfferings[msg.sender];
        
        // Distribute rewards based on valid burns
        if (validBurns > 0) {
            uint256 rewardAmount = validBurns * REWARD_PER_BURN;
            require(transfer(msg.sender, rewardAmount), "Transfer failed");
            emit BurnRewardsClaimed(msg.sender, validBurns, rewardAmount);
        }
    }

    /**
     * @notice Remove a single token from an address's altar offerings
     * @param owner Address that placed the token
     * @param tokenId Token ID to remove
     */
    function removeTokenFromAltar(address owner, uint256 tokenId) internal {
        uint256[] storage offerings = altarOfferings[owner];
        for(uint256 i = 0; i < offerings.length; i++) {
            if(offerings[i] == tokenId) {
                offerings[i] = offerings[offerings.length - 1];
                offerings.pop();
                delete tokenIdToAltarAddress[tokenId];
                break;
            }
        }
        
        if(offerings.length == 0) {
            delete altarOfferings[owner];
        }
    }

    /**
     * @notice Sets the merkle root for airdrop verification
     * @param _merkleRoot The merkle root hash
     */
    function setMerkleRoot(bytes32 _merkleRoot) external onlyRole(DEFAULT_ADMIN_ROLE) {
        merkleRoot = _merkleRoot;
        emit MerkleRootSet(_merkleRoot);
    }

    /**
     * @notice Claim airdrop tokens based on merkle proof
     * @param amount Amount of tokens to claim
     * @param merkleProof Array of hashes forming the merkle proof
     */
    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimedAirdrop[msg.sender], "Already claimed airdrop");
        
        // Verify the merkle proof
        bytes32 node = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "Invalid proof");

        // Mark as claimed and transfer tokens
        hasClaimedAirdrop[msg.sender] = true;
        require(transfer(msg.sender, amount), "Transfer failed");
        
        emit AirdropClaimed(msg.sender, amount);
    }

    /**
     * @notice Transfers admin control to the timelock controller
     * @dev Can only be called by the current admin
     * @param timelock The address of the timelock controller
     */
    function transferAdminControl(address timelock) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(timelock != address(0), "Cannot transfer admin role to zero address");
        
        // Grant admin role to timelock
        _grantRole(DEFAULT_ADMIN_ROLE, timelock);
        
        // Revoke admin role from current admin (msg.sender)
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // The following functions are overrides required by Solidity.
    /**
     * @inheritdoc ERC20
     */ 
    /**
     * @inheritdoc ERC20Votes
     */ 
    /**
     * @notice 
     * @param from The address which transferred the tokens.
     * @param to The address which received the tokens.
     * @param value The amount of tokens transferred.
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /**
     * @notice Retrieves the nonce for a particular owner.
     * @param owner The address of the owner for which the nonce is retrieved.
     * @return The nonce for the given owner.
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
