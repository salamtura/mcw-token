pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./MocrowCoin.sol";
import "./Whitelistable.sol";


contract MocrowCoinCrowdsale is Whitelistable, Pausable {
    using SafeMath for uint256;

    uint256 public constant DECIMALS = 18;

    uint256 public constant HARDCAP_TOKENS_PRE_ICO = 59561520 * (10 ** DECIMALS);
    uint256 public constant HARDCAP_TOKENS_ICO = 139999994 * (10 ** DECIMALS);
    uint256 public constant COMPAIGN_ALLOCATION_AND_BONUSES_TOKENS = 15756152 * (10 ** DECIMALS);

    uint256 public constant TOKEN_RATE_PRE_ICO = 17934;
    uint256 public constant TOKEN_RATE_ICO = 35868;

    uint256 public constant MINIMAL_INVESTMENT = 0.1 ether;
    uint256 public constant MAXIMAL_INVESTMENT = 5 ether;

    uint256 public constant MINIMAL_TEN_PERCENT_BONUS_BY_VALUE = 3.5 ether;
    uint256 public constant MINIMAL_FIVE_PERCENT_BONUS_BY_VALUE = 2.5 ether;

    mapping(address => uint256) public investmentsPreIco;
    address[] private investorsPreIco;

    mapping(address => uint256) public investmentsIco;
    address[] private investorsIco;

    uint256 public preIcoDurationDays = 10;
    uint256 public startTimePreIco;
    uint256 public endTimePreIco;

    uint256 public daysDelayAfterPreIco = 10;

    uint256 public icoDurationDays = 60;
    uint256 public startTimeIco;
    uint256 public endTimeIco;

    uint256 public icoTenPercentBonusEnded;
    uint256 public icoFivePercentBonusEnded;

    address private withdrawalWallet1;
    address private withdrawalWallet2;
    address private withdrawalWallet3;
    address private withdrawalWallet4;

    uint256 public withdrawalWallet1Percent = 50;
    uint256 public withdrawalWallet2Percent = 20;
    uint256 public withdrawalWallet3Percent = 15;
    uint256 public withdrawalWallet4Percent = 15;

    address private addressForCampaignAllocation;
    address private addressForUnsoldTokens;

    uint256 public preIcoTokenRateNegativeDecimals = 8;
    uint256 public preIcoTokenRate = TOKEN_RATE_PRE_ICO;
    uint256 public lastDayChangePreIcoTokenRate = 0;
    uint256 public tokensRemainingPreIco = HARDCAP_TOKENS_PRE_ICO;
    uint256 public tokensSoldPreIco = 0;
    uint256 public weiRaisedPreIco = 0;

    uint256 public icoTokenRateNegativeDecimals = 8;
    uint256 public icoTokenRate = TOKEN_RATE_ICO;
    uint256 public lastDayChangeIcoTokenRate = 0;
    uint256 public tokensRemainingIco = HARDCAP_TOKENS_PRE_ICO + HARDCAP_TOKENS_ICO;
    uint256 public tokensSoldIco = 0;
    uint256 public weiRaisedIco = 0;

    uint256 public tokensSoldTotal = 0;
    uint256 public weiRaisedTotal = 0;

    uint256 public compaignAllocationAndBonusRemainingTokens = COMPAIGN_ALLOCATION_AND_BONUSES_TOKENS;

    MocrowCoin public token;

    modifier beforePreIcoSalePeriod() {
        require(
            now < startTimePreIco,
            "Pre-ICO must not be started"
        );
        _;
    }

    modifier beforeIcoSalePeriod() {
        require(
            now < startTimeIco,
            "ICO must not be started"
        );
        _;
    }

    modifier preIcoSalePeriod () {
        require(
            isPreIco(),
            "Pre-ICO must be active"
        );
        _;
    }

    modifier icoSalePeriod() {
        require(
            isIco(),
            "ICO must be active"
        );
        _;
    }

    modifier afterIcoSalePeriod() {
        require(
            endTimeIco < now,
            "ICO must be ended"
        );
        _;
    }

    modifier minimalInvestment(uint256 _weiAmount) {
        require(
            _weiAmount >= MINIMAL_INVESTMENT,
            "Investment is less than min allowed amount"
        );
        _;
    }

    /**
    * @dev Constructor for MocrowCoinCrowdsale contract.
    * @dev Set the owner who can manage administrators, whitelist and token.
    * @param _token The address of MCW token contract.
    * @param _addressForCampaignAllocation The address to which remaining tokens for campaign allocation will be transferred.
    * @param _addressForUnsoldTokens The address to which unsold tokens will be transferred.
    * @param _withdrawalWallet1 The first withdrawal wallet address.
    * @param _withdrawalWallet2 The second withdrawal wallet address.
    * @param _withdrawalWallet3 The third withdrawal wallet address.
    * @param _withdrawalWallet4 The fourth withdrawal wallet address.
    * @param _startTimePreIco The start time of the pre-ICO and crowdsale in general.
    */
    constructor(
        address _token,
        address _addressForCampaignAllocation,
        address _addressForUnsoldTokens,
        address _withdrawalWallet1,
        address _withdrawalWallet2,
        address _withdrawalWallet3,
        address _withdrawalWallet4,
        uint256 _startTimePreIco) public 
        {
        require(
            _token != address(0) && _addressForCampaignAllocation != address(0) && _addressForUnsoldTokens != address(0),
            "Addresses must be not empty"
        );
        require(
            _withdrawalWallet1 != address(0) && _withdrawalWallet2 != address(0) && _withdrawalWallet3 != address(0) && _withdrawalWallet4 != address(0),
            "Addresses must be not empty"
        );
        require(
            _startTimePreIco > now,
            "Pre-ICO start time must be in the future"
        );

        startTimePreIco = _startTimePreIco;
        endTimePreIco = startTimePreIco + (preIcoDurationDays * 1 days);

        startTimeIco = endTimePreIco + (daysDelayAfterPreIco * 1 days);
        endTimeIco = startTimeIco + (icoDurationDays * 1 days);

        icoTenPercentBonusEnded = startTimeIco + (2 days);
        icoFivePercentBonusEnded = icoTenPercentBonusEnded + (3 days);

        withdrawalWallet1 = _withdrawalWallet1;
        withdrawalWallet2 = _withdrawalWallet2;
        withdrawalWallet3 = _withdrawalWallet3;
        withdrawalWallet4 = _withdrawalWallet4;

        lastDayChangePreIcoTokenRate = now;
        lastDayChangeIcoTokenRate = now;

        addressForCampaignAllocation = _addressForCampaignAllocation;
        addressForUnsoldTokens = _addressForUnsoldTokens;

        token = MocrowCoin(_token);
    }

    /**
    * @dev Fallback function can be used to buy tokens.
    */
    function() public payable {
        if (isPreIco()) {
            sellTokensPreIco();
        } else if (isIco()) {
            sellTokensIco();
        } else {
            revert("Pre-ICO or ICO stage must be active");
        }
    }

    /**
    * @dev Change pre-ICO start time.
    * @dev Only administrator or owner can change pre-ICO start time and only before pre-ICO period.
    * @dev The end time must be less than start time of ICO.
    * @param _startTimePreIco The start time which must be more than now time.
    */
    function changePreIcoStartTime(uint256 _startTimePreIco) public onlyAdministratorOrOwner beforePreIcoSalePeriod {
        require(
            now < _startTimePreIco,
            "Pre-ICO start time must be in the future"
        );
        uint256 _endTimePreIco = _startTimePreIco + (preIcoDurationDays * 1 days);
        require(
            _endTimePreIco < startTimeIco,
            "Pre-ICO end time must be earlier than ICO start time"
        );

        startTimePreIco = _startTimePreIco;
        endTimePreIco = _endTimePreIco;
    }

    /**
    * @dev Change ICO start time.
    * @dev Only administrator or owner can change ICO start time and only before ICO period.
    * @dev The end time must be less than start time of ICO.
    * @param _startTimeIco The start time which must be more than end time of the pre-ICO and more than now time.
    */
    function changeIcoStartTime(uint256 _startTimeIco) public onlyAdministratorOrOwner beforeIcoSalePeriod {
        require(
            _startTimeIco > now && _startTimeIco > endTimePreIco,
            "ICO start time must be in the future and later than Pre-ICO end time"
        );

        startTimeIco = _startTimeIco;
        endTimeIco = startTimeIco + (icoDurationDays * 1 days);

        icoTenPercentBonusEnded = startTimeIco + (2 days);
        icoFivePercentBonusEnded = icoTenPercentBonusEnded + (3 days);
    }

    /**
    * @dev Change pre-ICO token rate.
    * @dev Only administrator or owner can change pre-ICO token rate and only once per day.
    * @param _preIcoTokenRate Pre-ICO rate of the token.
    * @param _negativeDecimals Number of decimals after comma.
    */
    function changePreIcoTokenRate(uint256 _preIcoTokenRate, uint256 _negativeDecimals) public onlyAdministratorOrOwner {
        require(
            now > lastDayChangePreIcoTokenRate + 1 days,
            "Pre-ICO token rate might be changed only once per day"
        );

        preIcoTokenRate = _preIcoTokenRate;
        preIcoTokenRateNegativeDecimals = _negativeDecimals;
        lastDayChangePreIcoTokenRate = now;
    }

    /**
    * @dev Change ICO token rate.
    * @dev Only administrator or owner can change pre-ICO token rate and only once per day.
    * @param _icoTokenRate ICO rate of the token.
    * @param _negativeDecimals Number of decimals after comma.
    */
    function changeIcoTokenRate(uint256 _icoTokenRate, uint256 _negativeDecimals) public onlyAdministratorOrOwner {
        require(
            now > lastDayChangeIcoTokenRate + 1 days,
            "ICO token rate might be changed only once per day"
        );

        icoTokenRate = _icoTokenRate;
        icoTokenRateNegativeDecimals = _negativeDecimals;
        lastDayChangeIcoTokenRate = now;
    }

    /**
    * @dev Called by the owner or administrator to pause, triggers stopped state
    */
    function pause() public onlyAdministratorOrOwner whenNotPaused {
        paused = true;
        emit Pause();
    }

    /**
    * @dev Called by the owner or administrator to unpause, returns to normal state
    */
    function unpause() public onlyAdministratorOrOwner whenPaused {
        paused = false;
        emit Unpause();
    }

    /**
    * @dev Sell tokens during pre-ICO.
    * @dev Sell tokens only for whitelisted wallets if crawdsale is not paused.
    */
    function sellTokensPreIco()
    public payable
    preIcoSalePeriod
    whenWhitelisted(msg.sender)
    whenNotPaused
    minimalInvestment(msg.value)
    {
        require(
            tokensRemainingPreIco > 0,
            "Pre-ICO tokens pool must be not empty"
        );
        uint256 excessiveFunds = 0;
        uint256 weiAmount = msg.value;
        uint256 plannedAmount = weiAmount.add(getPreIcoInvestment(msg.sender));

        if (plannedAmount > MAXIMAL_INVESTMENT) {
            excessiveFunds = plannedAmount.sub(MAXIMAL_INVESTMENT);
            weiAmount = weiAmount.sub(excessiveFunds);
        }

        uint256 tokensAmount = weiAmount.div(preIcoTokenRate).mul(10 ** preIcoTokenRateNegativeDecimals);

        if (tokensRemainingPreIco < tokensAmount) {
            uint256 tokensDiff = tokensAmount.sub(tokensRemainingPreIco);
            uint256 excessiveFundsDiff = tokensDiff.mul(preIcoTokenRate).div(10 ** preIcoTokenRateNegativeDecimals);
            excessiveFunds = excessiveFunds.add(excessiveFundsDiff);

            weiAmount = weiAmount.sub(excessiveFundsDiff);
            tokensAmount = tokensRemainingPreIco;
        }

        withdrawalWalletsTransfer(weiAmount);

        transferTokensPreIco(msg.sender, weiAmount, tokensAmount);

        if (excessiveFunds > 0) {
            msg.sender.transfer(excessiveFunds);
        }
    }

    /**
    * @dev Sell tokens during pre-ICO for BTC.
    * @dev Only administrator or owner can sell tokens only for whitelisted wallets if crawdsale is not paused.
    */
    function sellTokensForBTCPreIco(address _wallet, uint256 _weiAmount)
    public
    onlyAdministratorOrOwner
    preIcoSalePeriod
    whenWhitelisted(_wallet)
    whenNotPaused
    minimalInvestment(_weiAmount)
    {
        uint256 tokensAmount = _weiAmount.div(preIcoTokenRate).mul(10 ** preIcoTokenRateNegativeDecimals);
        require(
            tokensRemainingPreIco > tokensAmount,
            "Remaining amount of Pre-ICO tokens must be more than the amount of purchased tokens"
        );
        transferTokensPreIco(_wallet, _weiAmount, tokensAmount);
    }

    /**
    * @dev Sell tokens during ICO.
    * @dev Sell tokens only for whitelisted wallets if crawdsale is not paused.
    */
    function sellTokensIco()
    public payable
    icoSalePeriod
    whenWhitelisted(msg.sender)
    whenNotPaused
    minimalInvestment(msg.value)
    {
        require(
            tokensRemainingIco > 0,
            "ICO tokens pool must be not empty"
        );
        uint256 excessiveFunds = 0;
        uint256 weiAmount = msg.value;
        uint256 plannedAmount = weiAmount.add(getIcoInvestment(msg.sender));

        if (plannedAmount > MAXIMAL_INVESTMENT) {
            excessiveFunds = plannedAmount.sub(MAXIMAL_INVESTMENT);
            weiAmount = weiAmount.sub(excessiveFunds);
        }

        uint256 tokensAmount = weiAmount.div(icoTokenRate).mul(10 ** icoTokenRateNegativeDecimals);

        if (tokensRemainingIco < tokensAmount) {
            uint256 tokensDiff = tokensAmount.sub(tokensRemainingIco);
            uint256 excessiveFundsDiff = tokensDiff.mul(icoTokenRate).div(10 ** icoTokenRateNegativeDecimals);
            excessiveFunds = excessiveFunds.add(excessiveFundsDiff);

            weiAmount = weiAmount.sub(excessiveFundsDiff);
            tokensAmount = tokensRemainingIco;
        }

        withdrawalWalletsTransfer(weiAmount);

        transferTokensIco(msg.sender, weiAmount, tokensAmount);

        if (excessiveFunds > 0) {
            msg.sender.transfer(excessiveFunds);
        }
    }

    /**
    * @dev Sell tokens during ICO for BTC.
    * @dev Only administrator or owner can sell tokens only for whitelisted wallets if crawdsale is not paused.
    */
    function sellTokensForBTCIco(address _wallet, uint256 _weiAmount)
    public
    onlyAdministratorOrOwner
    icoSalePeriod
    whenWhitelisted(_wallet)
    whenNotPaused
    minimalInvestment(_weiAmount)
    {
        uint256 tokensAmount = _weiAmount.div(icoTokenRate).mul(10 ** icoTokenRateNegativeDecimals);
        require(
            tokensRemainingIco > tokensAmount,
            "Remaining amount of ICO tokens must be more than the amount of purchased tokens"
        );
        transferTokensIco(_wallet, _weiAmount, tokensAmount);
    }

    /**
    * @dev Transfer unsold tokens.
    * @dev Transfer tokens only for administrators or owner and only after ICO period.
    */
    function transferUnsoldTokens() public onlyAdministratorOrOwner afterIcoSalePeriod {
        require(
            tokensRemainingIco > 0,
            "Amount of unsold tokens must be more than zero"
        );
        token.transferFromIco(addressForUnsoldTokens, tokensRemainingIco);
        tokensRemainingIco = 0;
    }

    /**
    * @dev Transfer remaining compaign allocation and bonus tokens.
    * @dev Transfer tokens only for administrators or owner and only after ICO period.
    */
    function transferRemainingCompaignAllocationAndBonusTokens() public onlyAdministratorOrOwner afterIcoSalePeriod {
        require(
            compaignAllocationAndBonusRemainingTokens > 0,
            "Amount of bonus tokens must be more than zero"
        );
        token.transferFromIco(addressForCampaignAllocation, compaignAllocationAndBonusRemainingTokens);
        compaignAllocationAndBonusRemainingTokens = 0;
    }

    /**
    * @dev Transfer ownership from ICO contract to the owner for whitelist contract.
    * @dev Transfer ownership only for administrators or owner and only after ICO period.
    */
    function transferOwnershipForWhitelist() public onlyAdministratorOrOwner afterIcoSalePeriod {
        require(
            compaignAllocationAndBonusRemainingTokens == 0 && tokensRemainingIco == 0,
            "Amounts of unsold tokens and bonus tokens must be equals to zero"
        );

        whitelist.transferOwnership(owner);
    }

    function isPreIco() public view returns(bool) {
        return startTimePreIco < now && now < endTimePreIco;
    }

    function isIco() public view returns(bool) {
        return startTimeIco < now && now < endTimeIco;
    }

    /**
    * @dev Count the pre-ICO investors total.
    */
    function getPreIcoInvestorsCount() public view returns(uint256) {
        return investorsPreIco.length;
    }

    /**
    * @dev Get the pre-ICO investor address.
    * @param _index the index of investor in the array. 
    */
    function getPreIcoInvestor(uint256 _index) public view returns(address) {
        return investorsPreIco[_index];
    }

    /**
    * @dev Gets the total amount of investments for pre-ICO investor.
    * @param _investorPreIco the pre-ICO investor address.
    */
    function getPreIcoInvestment(address _investorPreIco) public view returns(uint256) {
        return investmentsPreIco[_investorPreIco];
    }

    /**
    * @dev Count the ICO investors total.
    */
    function getIcoInvestorsCount() public view returns(uint256) {
        return investorsIco.length;
    }

    /**
    * @dev Get the ICO investor address.
    * @param _index the index of investor in the array. 
    */
    function getIcoInvestor(uint256 _index) public view returns(address) {
        return investorsIco[_index];
    }

    /**
    * @dev Gets the total amount of investments for ICO investor.
    * @param _investorIco the ICO investor address.
    */
    function getIcoInvestment(address _investorIco) public view returns(uint256) {
        return investmentsIco[_investorIco];
    }

    /**
    * @dev Transfer to withdrawal wallets with considering of percentage.
    */
    function withdrawalWalletsTransfer(uint256 value) private {
        uint256 withdrawalWallet1Value = withdrawalWallet1Percent.mul(value).div(100);
        uint256 withdrawalWallet2Value = withdrawalWallet2Percent.mul(value).div(100);
        uint256 withdrawalWallet3Value = withdrawalWallet3Percent.mul(value).div(100);
        uint256 withdrawalWallet4Value = value.sub(withdrawalWallet1Value.add(withdrawalWallet2Value).add(withdrawalWallet3Value));
        withdrawalWallet1.transfer(withdrawalWallet1Value);
        withdrawalWallet2.transfer(withdrawalWallet2Value);
        withdrawalWallet3.transfer(withdrawalWallet3Value);
        withdrawalWallet4.transfer(withdrawalWallet4Value);
    }

    /**
    * @dev Transfer tokens during pre-ICO.
    * @dev Available within contract only.
    */
    function transferTokensPreIco(address _walletOwner, uint256 _weiAmount, uint256 _tokensAmount) private {
        tokensRemainingPreIco = tokensRemainingPreIco.sub(_tokensAmount);
        tokensRemainingIco = tokensRemainingIco.sub(_tokensAmount);

        tokensSoldPreIco = tokensSoldPreIco.add(_tokensAmount);
        tokensSoldTotal = tokensSoldTotal.add(_tokensAmount);

        weiRaisedPreIco = weiRaisedPreIco.add(_weiAmount);
        weiRaisedTotal = weiRaisedTotal.add(_weiAmount);

        if (investmentsPreIco[_walletOwner] == 0) {
            investorsPreIco.push(_walletOwner);
        }
        investmentsPreIco[_walletOwner] = investmentsPreIco[_walletOwner].add(_weiAmount);

        token.transferFromIco(_walletOwner, _tokensAmount);
    }

    /**
    * @dev Transfer tokens during ICO.
    * @dev Available within contract only.
    */
    function transferTokensIco(address _walletOwner, uint256 _weiAmount, uint256 _tokensAmount) private {
        uint256 bonusTokens = 0;

        if (compaignAllocationAndBonusRemainingTokens > 0) {
            uint256 bonus = 0;
            if (now < icoTenPercentBonusEnded) {
                bonus = bonus.add(10);
            } else if (now < icoFivePercentBonusEnded) {
                bonus = bonus.add(5);
            }

            if (_weiAmount >= MINIMAL_TEN_PERCENT_BONUS_BY_VALUE) {
                bonus = bonus.add(10);
            } else if (_weiAmount >= MINIMAL_FIVE_PERCENT_BONUS_BY_VALUE) {
                bonus = bonus.add(5);
            }

            bonusTokens = _tokensAmount.mul(bonus).div(100);

            if (compaignAllocationAndBonusRemainingTokens < bonusTokens) {
                bonusTokens = compaignAllocationAndBonusRemainingTokens;
            }
            compaignAllocationAndBonusRemainingTokens = compaignAllocationAndBonusRemainingTokens.sub(bonusTokens);
        }

        tokensRemainingIco = tokensRemainingIco.sub(_tokensAmount);

        tokensSoldIco = tokensSoldIco.add(_tokensAmount);
        tokensSoldTotal = tokensSoldTotal.add(_tokensAmount);

        weiRaisedIco = weiRaisedIco.add(_weiAmount);
        weiRaisedTotal = weiRaisedTotal.add(_weiAmount);

        uint256 tokensAmountWithBonuses = _tokensAmount.add(bonusTokens);

        if (investmentsIco[_walletOwner] == 0) {
            investorsIco.push(_walletOwner);
        }
        investmentsIco[_walletOwner] = investmentsIco[_walletOwner].add(_weiAmount);

        token.transferFromIco(_walletOwner, tokensAmountWithBonuses);
    }
}