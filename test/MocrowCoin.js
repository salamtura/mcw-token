import { EVMThrow, assertEqual } from './utils';
import {
  reservedTokensForFoundersFoundation,
  validAmountForFoundersFoundation,
  reservedTokensForPlatformOperations,
  reservedTokensForRoiOnCapital,
  reservedTokensForFinancialInstituion,
  reservedTokensForCynotrust,
  reservedTokensForCryptoExchanges,
  reservedTokensForTechDev,
  reservedTokensPreIco,
  reservedTokensIco,
  reservedTokensIcoBonuses,
  totalSupply,
  getDefaultWallets,
} from './utils/constants';

const MocrowCoin = artifacts.require('MocrowCoin');
const RecipientContract = artifacts.require('RecipientContract');

contract('MocrowCoin', (wallets) => {
  const {
    owner,
    foundersFoundationReserve,
    platformOperationsReserve,
    roiOnCapitalReserve,
    financialInstitutionReserve,
    cynotrustReserve,
    cryptoExchangesReserve,
    furtherTechDevelopmentReserve,
    withdrawal1,
    client3,
  } = getDefaultWallets(wallets);

  describe('should have correct parameters', function () {
    const expectedTokenName = 'MOCROW';
    const expectedTokenSymbol = 'MCW';
    const expectedTokenDecimals = 18;
    before(async () => {
      this.token = await MocrowCoin.new(
        foundersFoundationReserve,
        platformOperationsReserve,
        roiOnCapitalReserve,
        financialInstitutionReserve,
        cynotrustReserve,
        cryptoExchangesReserve,
        furtherTechDevelopmentReserve,
      );
    });

    it('name', async () => {
      const tokenName = await this.token.name();
      assertEqual(tokenName, expectedTokenName);
    });

    it('symbol', async () => {
      const tokenSymbol = await this.token.symbol();
      assertEqual(tokenSymbol, expectedTokenSymbol);
    });

    it('decimals', async () => {
      const tokenDecimals = (await this.token.decimals()).toNumber();
      assertEqual(tokenDecimals, expectedTokenDecimals);
    });

    it('RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION', async () => {
      const actualReservedTokensForFoundersFoundation = (
        await this.token.RESERVED_TOKENS_FOR_FOUNDERS_AND_FOUNDATION()).toNumber();
      assertEqual(
        actualReservedTokensForFoundersFoundation,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS', async () => {
      const actualReservedTokensForPlatformOperations = (
        await this.token.RESERVED_TOKENS_FOR_PLATFORM_OPERATIONS()).toNumber();
      assertEqual(
        actualReservedTokensForPlatformOperations,
        reservedTokensForPlatformOperations.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_ROI_ON_CAPITAL', async () => {
      const actualReservedTokensForRoiOnCapital = (
        await this.token.RESERVED_TOKENS_FOR_ROI_ON_CAPITAL()).toNumber();
      assertEqual(
        actualReservedTokensForRoiOnCapital,
        reservedTokensForRoiOnCapital.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION', async () => {
      const actualReservedTokensForFinancialInstitution = (
        await this.token.RESERVED_TOKENS_FOR_FINANCIAL_INSTITUTION()).toNumber();
      assertEqual(
        actualReservedTokensForFinancialInstitution,
        reservedTokensForFinancialInstituion.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_CYNOTRUST', async () => {
      const actualReservedTokensForCynotrust = (
        await this.token.RESERVED_TOKENS_FOR_CYNOTRUST()).toNumber();
      assertEqual(
        actualReservedTokensForCynotrust,
        reservedTokensForCynotrust.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES', async () => {
      const actualReservedTokensForCryptoExchanges = (
        await this.token.RESERVED_TOKENS_FOR_CRYPTO_EXCHANGES()).toNumber();
      assertEqual(
        actualReservedTokensForCryptoExchanges,
        reservedTokensForCryptoExchanges.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT', async () => {
      const actualReservedTokensForTechDev = (
        await this.token.RESERVED_TOKENS_FOR_FURTHER_TECH_DEVELOPMENT()).toNumber();
      assertEqual(
        actualReservedTokensForTechDev,
        reservedTokensForTechDev.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_PRE_ICO', async () => {
      const actualReservedTokensForPreIco = (
        await this.token.RESERVED_TOKENS_FOR_PRE_ICO()).toNumber();
      assertEqual(
        actualReservedTokensForPreIco,
        reservedTokensPreIco.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_ICO', async () => {
      const actualReservedTokensForIco = (
        await this.token.RESERVED_TOKENS_FOR_ICO()).toNumber();
      assertEqual(
        actualReservedTokensForIco,
        reservedTokensIco.toNumber(),
      );
    });

    it('RESERVED_TOKENS_FOR_ICO_BONUSES', async () => {
      const actualReservedTokensForIcoBonuses = (
        await this.token.RESERVED_TOKENS_FOR_ICO_BONUSES()).toNumber();
      assertEqual(
        actualReservedTokensForIcoBonuses,
        reservedTokensIcoBonuses.toNumber(),
      );
    });

    it('TOTAL_SUPPLY_VALUE', async () => {
      const actualTotalSupplyValue = (await this.token.TOTAL_SUPPLY_VALUE()).toNumber();
      assertEqual(actualTotalSupplyValue, totalSupply.toNumber());
    });
  });

  describe('should transfer tokens right', function () {
    beforeEach(async () => {
      this.token = await MocrowCoin.new(
        foundersFoundationReserve,
        platformOperationsReserve,
        roiOnCapitalReserve,
        financialInstitutionReserve,
        cynotrustReserve,
        cryptoExchangesReserve,
        furtherTechDevelopmentReserve,
      );

      await this.token.approve(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );
    });

    it('function transfer', async () => {
      await this.token.transfer(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualClientBalance = (
        await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        actualClientBalance,
        validAmountForFoundersFoundation.toNumber(),
      );
    });

    it('function transferFrom', async () => {
      await this.token.transferFrom(
        foundersFoundationReserve,
        client3,
        validAmountForFoundersFoundation,
        { from: client3 },
      );

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualClientBalance = (await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        actualClientBalance,
        validAmountForFoundersFoundation.toNumber(),
      );
    });

    it('should reject the request to function transfer if the contract is paused', async () => {
      await this.token.pause({ from: owner });

      const transfer = this.token.transfer(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      await transfer.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('should reject the request to function transferFrom if the contract is paused', async () => {
      await this.token.pause({ from: owner });

      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        client3,
        validAmountForFoundersFoundation,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('function transfer to freezed acсount', async () => {
      await this.token.freezeAccount(client3, { from: owner });

      await this.token.transfer(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualClientBalance = (
        await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        actualClientBalance,
        validAmountForFoundersFoundation.toNumber(),
      );
    });

    it('function transferFrom to freezed acсount', async () => {
      await this.token.freezeAccount(withdrawal1, { from: owner });
      const withdrawal1Balance = await this.token.balanceOf(withdrawal1);

      await this.token.transferFrom(
        foundersFoundationReserve,
        withdrawal1,
        validAmountForFoundersFoundation,
        { from: client3 },
      );

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualWithdrawal1Balance = (await this.token.balanceOf(withdrawal1)).toNumber();
      assertEqual(
        actualWithdrawal1Balance,
        withdrawal1Balance.add(validAmountForFoundersFoundation).toNumber(),
      );
    });

    it('should reject the request to function transfer if sender balance is frozen', async () => {
      await this.token.freezeAccount(foundersFoundationReserve, { from: owner });

      const transfer = this.token.transfer(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      await transfer.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('should reject the request to function transferFrom if sender balance is frozen', async () => {
      await this.token.freezeAccount(client3, { from: owner });

      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        withdrawal1,
        validAmountForFoundersFoundation,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('should reject the request to function transferFrom if token owner balance is frozen', async () => {
      await this.token.freezeAccount(foundersFoundationReserve, { from: owner });

      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        withdrawal1,
        validAmountForFoundersFoundation,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });

    it('should allow the tokens transfer to contract', async () => {
      const recipient = await RecipientContract.new();
      await recipient.setForward(client3, { from: foundersFoundationReserve });
      const recipientAddress = recipient.address;

      await this.token.approveAndCall(
        recipientAddress,
        validAmountForFoundersFoundation,
        0,
        { from: foundersFoundationReserve },
      );

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualReservedTokensForFounders,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualClientBalance = (
        await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        actualClientBalance,
        validAmountForFoundersFoundation.toNumber(),
      );
    });
  });
});
