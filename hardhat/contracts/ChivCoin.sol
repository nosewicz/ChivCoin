// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IChivNFTs.sol";

contract ChivCoin is ERC20, Ownable {

  uint256 public constant tokenPrice = 0.001 ether;

  //each nft gets holder 10 ChivCoin
  uint256 public constant tokensPerNFT = 10 * 10**18;

  // max supply is 10k tokens
  uint256 public constant maxTotalSupply = 10000 * 10**18;

  IChivNFTs ChivivusNFTs;

  //track what nft ids have been claimed
  mapping(uint256 => bool) public tokenIdsClaimed;

  constructor(address _ChivNFTsContract) ERC20("ChivCoin", "CC") {
    ChivivusNFTs = IChivNFTs(_ChivNFTsContract);
  }

  function mint(uint256 amount) public payable {
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount, "Amount of Ether sent is incorrect");

    uint256 amountWithDecimals = amount * 10**18;
    require((totalSupply() + amountWithDecimals) <= maxTotalSupply, "Exceeds the max total supply avilable");

    _mint(msg.sender, amountWithDecimals);
  }

  function claim() public {
    address sender = msg.sender;
    //get number of NFTs held by sender
    uint256 balance = ChivivusNFTs.balanceOf(sender);
    require(balance > 0, "you don't own any ChivivusVerse NFTs");
    //amount keeps track of unclaimed tokenIds
    uint256 amount = 0;
    for (uint256 i = 0; i < balance; i++) {
      uint256 tokenId = ChivivusNFTs.tokenOfOwnerByIndex(sender, i);
      if (!tokenIdsClaimed[tokenId]) {
        amount += 1;
        tokenIdsClaimed[tokenId] = true;
      }
    }
    require(amount > 0, "All tokens have been claimed for these NFTs");
    _mint(msg.sender, amount * tokensPerNFT);
  }

  function withdraw() public onlyOwner {
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent, ) = _owner.call{value: amount}("");
    require(sent, "failed withdraw ether");
  }

  receive() external payable {}

  fallback() external payable {}

}