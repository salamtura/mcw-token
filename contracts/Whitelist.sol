pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Whitelist contract
 * @dev Whitelist for wallets.
*/
contract Whitelist is Ownable {
    mapping(address => bool) whitelist;

    uint256 public whitelistLength = 0;

    /**
    * @dev Add wallet to whitelist.
    * @dev Accept request from the owner only.
    * @param _wallet The address of wallet to add.
    */
    function addWallet(address _wallet) public onlyOwner {
        require(
            _wallet != address(0),
            "Address must be not empty"
        );
        require(
            !isWhitelisted(_wallet),
            "Address is already in the whitelist"
        );
        whitelist[_wallet] = true;
        whitelistLength++;
    }

    /**
    * @dev Remove wallet from whitelist.
    * @dev Accept request from the owner only.
    * @param _wallet The address of whitelisted wallet to remove.
    */  
    function removeWallet(address _wallet) public onlyOwner {
        require(
            _wallet != address(0),
            "Address must be not empty"
        );
        require(
            isWhitelisted(_wallet),
            "Address is not in the whitelist"
        );
        whitelist[_wallet] = false;
        whitelistLength--;
    }

    /**
    * @dev Check the specified wallet whether it is in the whitelist.
    * @param _wallet The address of wallet to check.
    */
    function isWhitelisted(address _wallet) public view returns (bool) {
        return whitelist[_wallet];
    }
}