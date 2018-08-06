pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


interface tokenERC20 { function transferFrom(address from, address to, uint256 value) external returns (bool); }


contract RecipientContract is Ownable {

    address forwardTo;

    constructor() public { }

    function setForward(address _to) public onlyOwner {
        require(
            _to != address(0),
            "Address must be not empty"
        );
        forwardTo = _to;
    }

    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes _extraData)
        public returns (bool)
        {
        tokenERC20 token = tokenERC20(_token);
        token.transferFrom(_from, forwardTo, _value);
        return true;
    }
}