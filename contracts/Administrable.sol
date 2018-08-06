pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Administrable
 * @dev The Administrable contract has an owner and administrators addresses
 */
contract Administrable is Ownable {
    mapping(address => bool) private administrators;
    uint256 public administratorsLength = 0;

    /**
     * @dev Throws if called by any account other than the owner or administrator.
     */
    modifier onlyAdministratorOrOwner() {
        require(
            msg.sender == owner || administrators[msg.sender],
            "Sender not authorized to perform such operation."
        );
        _;
    }

    function addAdministrator(address _admin) public onlyOwner {
        require(
            administratorsLength < 3,
            "Admins list might has only 3 admins"
        );
        require(
            !administrators[_admin],
            "Address is already in the admins list"
        );
        require(
            _admin != address(0) && _admin != owner,
            "Address must be not empty and not the address of the owner"
        );
        administrators[_admin] = true;
        administratorsLength++;
    }

    function removeAdministrator(address _admin) public onlyOwner {
        require(
            _admin != address(0),
            "Address must be not empty"
        );
        require(
            administrators[_admin],
            "Address is not in the admins list"
        );
        administrators[_admin] = false;
        administratorsLength--;
    }

    function isAdministrator(address _admin) public view returns (bool) {
        return administrators[_admin];
    }
}
