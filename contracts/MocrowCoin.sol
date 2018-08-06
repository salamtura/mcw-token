pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./FreezableToken.sol";


interface tokenRecipient {
    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes _extraData)
    external;
}


contract MocrowCoin is StandardToken, BurnableToken, FreezableToken, Pausable {
    string public constant name = "MOCROW";
    string public constant symbol = "MCW";
    uint8 public constant decimals = 18;

    uint256 public constant RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION = 201700456 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS = 113010700 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_ROI_ON_CAPITAL = 9626337 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION = 77010700 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_CYNOTRUST = 11551604 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES = 244936817 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT = 11551604 * (10 ** uint256(decimals));

    uint256 public constant RESERVED_TOKENS_FOR_PRE_ICO = 59561520 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_ICO = 139999994 * (10 ** uint256(decimals));
    uint256 public constant RESERVED_TOKENS_FOR_ICO_BONUSES = 15756152 * (10 ** uint256(decimals));

    uint256 public constant TOTAL_SUPPLY_VALUE = 884705884 * (10 ** uint256(decimals));

    address public addressIco;

    bool isIcoSet = false;

    modifier onlyIco() {
        require(
            msg.sender == addressIco,
            "Address must be the address of the ICO"
        );
        _;
    }

    /**
    * @dev Create MocrowCoin contract with reserves.
    * @param _foundersFoundationReserve The address of founders and foundation reserve.
    * @param _platformOperationsReserve The address of platform operations reserve.
    * @param _roiOnCapitalReserve The address of roi on capital reserve.
    * @param _financialInstitutionReserve The address of financial institution reserve.
    * @param _cynotrustReserve The address of Cynotrust reserve.
    * @param _cryptoExchangesReserve The address of crypto exchanges reserve.
    * @param _furtherTechDevelopmentReserve The address of further tech development reserve.
    */
    constructor(
        address _foundersFoundationReserve,
        address _platformOperationsReserve,
        address _roiOnCapitalReserve,
        address _financialInstitutionReserve,
        address _cynotrustReserve,
        address _cryptoExchangesReserve,
        address _furtherTechDevelopmentReserve) public
        {
        require(
            _foundersFoundationReserve != address(0) && 
            _platformOperationsReserve != address(0) && _roiOnCapitalReserve != address(0) && _financialInstitutionReserve != address(0),
            "Addresses must be not empty"
        );

        require(
            _cynotrustReserve != address(0) && 
            _cryptoExchangesReserve != address(0) && _furtherTechDevelopmentReserve != address(0),
            "Addresses must be not empty"
        );

        balances[_foundersFoundationReserve] = RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION);
        emit Transfer(address(0), _foundersFoundationReserve, RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION);

        balances[_platformOperationsReserve] = RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS);
        emit Transfer(address(0), _platformOperationsReserve, RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS);

        balances[_roiOnCapitalReserve] = RESERVED_TOKENS_FOR_ROI_ON_CAPITAL;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_ROI_ON_CAPITAL);
        emit Transfer(address(0), _roiOnCapitalReserve, RESERVED_TOKENS_FOR_ROI_ON_CAPITAL);

        balances[_financialInstitutionReserve] = RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION);
        emit Transfer(address(0), _financialInstitutionReserve, RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION);

        balances[_cynotrustReserve] = RESERVED_TOKENS_FOR_CYNOTRUST;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_CYNOTRUST);
        emit Transfer(address(0), _cynotrustReserve, RESERVED_TOKENS_FOR_CYNOTRUST);

        balances[_cryptoExchangesReserve] = RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES);
        emit Transfer(address(0), _cryptoExchangesReserve, RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES);

        balances[_furtherTechDevelopmentReserve] = RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT;
        totalSupply_ = totalSupply_.add(RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT);
        emit Transfer(address(0), _furtherTechDevelopmentReserve, RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT);
    }

    /**
    * @dev Transfer token for a specified address with pause and freeze features for owner.
    * @dev Only applies when the transfer is allowed by the owner.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        require(
            !isFrozen(msg.sender),
            "Transfer possibility must be unfrozen for the address"
        );
        return super.transfer(_to, _value);
    }

    /**
    * @dev Transfer tokens from one address to another with pause and freeze features for owner.
    * @dev Only applies when the transfer is allowed by the owner.
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amount of tokens to be transferred
    */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        require(
            !isFrozen(msg.sender),
            "Transfer possibility must be unfrozen for the address"
        );
        require(
            !isFrozen(_from),
            "Transfer possibility must be unfrozen for the address"
        );
        return super.transferFrom(_from, _to, _value);
    }

    /**
    * @dev Transfer tokens from ICO address to another address.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transferFromIco(address _to, uint256 _value) public onlyIco returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
    * @dev Set ICO address.
    * @param _addressIco The address of ICO contract.
    */
    function setIco(address _addressIco) public onlyOwner {
        require(
            _addressIco != address(0),
            "Address must be not empty"
        );

        require(
            !isIcoSet,
            "ICO address is already set"
        );
        
        addressIco = _addressIco;

        uint256 amountToSell = RESERVED_TOKENS_FOR_PRE_ICO.add(RESERVED_TOKENS_FOR_ICO).add(RESERVED_TOKENS_FOR_ICO_BONUSES);
        balances[addressIco] = amountToSell;
        totalSupply_ = totalSupply_.add(amountToSell);
        emit Transfer(address(0), addressIco, amountToSell);

        isIcoSet = true;        
    }

    /**
    * Set allowance for other address and notify
    *
    * Allows `_spender` to spend no more than `_value` tokens on your behalf, and then ping the contract about it
    *
    * @param _spender The address authorized to spend
    * @param _value the max amount they can spend
    * @param _extraData some extra information to send to the approved contract
    */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(
                msg.sender,
                _value, this,
                _extraData);
            return true;
        }
    }

}
