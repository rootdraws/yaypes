# Enlightened YAYPEs

## $YAY Governance Documentation

This repository contains contracts for:

1. $YAY token
2. Merkle Claim
3. $YAY Burn Bounty
4. $YAY DAO LP Farm

YAYPEs is a derivative project of [Yaypegs](https://yaypegs.com/), released on Base. After one month of trading, the project has only done 11 ETH in volume, and a sale of 600 yaypes would bring the floor to below .0001 ETH per YAYPE.

The artist, [ccmoret](https://x.com/ccmoret), has invested creative energy into the artwork for the project, and the current trade volume of YAYPEs does not reflect this artistic effort.

Below is a chart of the current trade volume:
![YAYPE Summary](https://github.com/rootdraws/yaypes/blob/main/pitchdeck/SummaryChart.png)

## Thesis

There are too many YAYPES, and we ought to create an incentivized burn program to reduce supply.

Proposed Strategy:

1. Launch Token Gated Discord, so YAYPEs can socialize.
2. Airdrop 1 $YAY to YAYPE Holders, for distribution.
3. Burn 1 YAYPE for 1 $YAY to correct supply overhang.
4. Form a DAO using PartyDAO to manage LP - entry costs .1 ETH.
5. Create DAO Owned $YAY/ETH LP on Univ2.
6. Create DAO Owned Pool on Sudoswap.
7. Launch YAY-ETH Univ2 LP Farm to bootstrap liquiidty.

Enlightened YAYPEs will launch these strategies, to test their impact on the project.

## $YAY Tokenomics

The YAYPEs NFT Collection has a total supply of 10,000 NFTs. There are currently 2753 holders of these NFTs.

$YAY Total Supply: 40,000

* 10,000 $YAY is allocated to the Merkle Claim, meaning 1 $YAY per YAYPE.
* 10,000 $YAY is allocated to the Burn Bounty, meaning 1 $YAY per Burned YAYPE.
* 10,000 $YAY is allocated to a PartyDAO. Membership will cost .1 ETH.
  * 50% of the ETH raised will be used to create a DAO Owned $YAY/ETH LP on UniswapV2.
  * 50% of the ETH raised will be used to create a DAO Owned Pool on Sudoswap.
* 10,000 $YAY is allocated to Univ2 LP Incentives, which will accumulate to the DAO over 1 month.

### Project Goals

1. Reduce the supply of YAYPEs through Incentivized Burns.
2. Increase NFT Liquidity, and DAO Revenue through a DAO owned Sudoswap Pool.
3. Provide DAO Owned $YAY/ETH LP on UniswapV2, and earn fees.
4. Increase the number of unique wallets interacting with the project, through providing LP for $YAY trading on Base.
5. Reward DAO members with $YAY emissions.

## Participation Guide

### NFT Holders

* 1 $YAY will be airdropped to each NFT Holder.
* 1 $YAY will be rewarded to each user who burns a YAYPE.

It is possible that the entire YAYPE NFT supply could be burned in exchange for $YAY, but it seems more likely that the supply will be aesthetically culled through burn selection, and that the $YAY supply will be absorbed by meme-driven trading on Base -- which represent a different type of speculator than the NFT holders.

There may even be an acceleration of this process or YAYPE to $YAY arbitrage, as the NFTs become more scarce.

### PartyDAO Members

* Membership to the PartyDAO will cost .1 ETH, and will be limited to YAYPE NFT Holders.
* 10,000 YAY will be allocated to the DAO, to be used in $YAY/ETH LP.
* If anyone rage quits before LP creation, we cancel deployment.
* 50% of ETH raised will be used to create a DAO Owned $YAY/ETH LP on UniswapV2.
* 50% of ETH raised will be used to create a DAO Owned Pool on Sudoswap.

Instead of going with a traditional yield farm model, where you stake LPs, $YAY Emissions will be distributed to the DAO over the course of 1 month, and members will be able to rage quit with their share, or continue to operate the DAO.

This will reduce transaction overhead for the DAO, because the only transactions required will be to seed the Sudoswap Pool, and to launch the univ2 LP.

Over the course of the 1 month, the DAO will receive $YAY emissions, and individual members will hold rage quit equity over the value of the LP and the $YAY emissions.

Some will leave, and some will stay -- but the burned YAYPEs are gone forever.

## Burn Dynamics

The [YAYPE Contract](https://basescan.org/token/0x53d8cbfa0abfeab01ab5997827e67069c6b46c7a) currently allows for holders to burn one NFT at a time, by entering the tokenID and calling burn().

The $YAY contract uses a three part system to execute these burns:

1) The User places the YAYPE on an altar, creating an array which connects the TokenID to the Address of the User.
2) The User calls the burn() on the YAYPE contract, which gives the YAYPE to the Owner(0x0000000000000000000000000000000000000000).
3) The User calls a meditate() function, which looks at the tokenID in the array for that user, and then checks ownership to see if Owner(0x0000000000000000000000000000000000000000) is the owner of the YAYPE. If so, the user is rewarded with a balance of 1 $YAY.
4) The user calls a claimReward() function, which transfers the $YAY to the user's address.

### Burn Sequencer

The burn process must be executed sequentially, and due to limitations in the YAYPE contract, only one YAYPE can be burned at a time.

The UI will provide the user with an automated sequencer, which prompts each transaction, based on the NFTs they have selected to burn.

1) User selectes NFTs to be Burned.
2) Those tokenIds are placed on the altar.
3) Burns are called one at a time, for each selected tokenID.
4) Meditate() is called after the NFTs are burned.
5) ClaimReward() is called to distribute the 1 $YAY for each burned NFT.

The Meditate() acts as a check on the Array, adds the rewards up to a sum which is associated with that user, and then clears the array.

Using a sequencer will streamline the process, and allow for 'bulk burns' to be executed.

### Merkle Claim

A Snapshot has been taken of the NFT holders as of Jan 18th, 2025.
A UI will allow users to claim their $YAY, and immediately burn their NFTs for more $YAY.

### $YAY DAO LP Farm

Following the Claim, and Burn, the user will have an opportunity to join a PartyDAO.

The PartyDAO will be the sole beneficiary of the $YAY emissions, and YAYPE NFT holders will be the only ones allowed to buy membership.

## Potential Outcomes

We could see a significant reduction in the supply of YAYPEs, along with increased trade volume, due to DAO owned Sudoswap LP.

The DAO will earn some in fees from both Sudoswap and Univ2 LP.

DAO members will be able to observe over a 1 month period, what the outcome is of this experiment, and during this month, the remaining YAY emissions will be distributed to them.

At the end of that month, the DAO will have another 10,000 $YAY -- the remainder of the supply, and they can decide what to do with those funds, or they can rage quit.

## Discord

We will also launch a discord, where we can have a bot that tracks NFT sales, and offers a heightened status for LP DAO members.