import { EVMThrow, assertEqual } from './utils';
import {
  reservedTokensForFoundersFoundation,
  validAmountForFoundersFoundation,
  invalidAmountForFoundersFoundation,
  reservedTokensPreIco,
  reservedTokensIco,
  reservedTokensIcoBonuses,
  totalSupply,
  getDefaultWallets,
} from './utils/constants';

const MocrowCoin = artifacts.require('MocrowCoin');

contract('MocrowCoin', (wallets) => {
  const {
    foundersFoundationReserve,
    platformOperationsReserve,
    roiOnCapitalReserve,
    financialInstitutionReserve,
    cynotrustReserve,
    cryptoExchangesReserve,
    furtherTechDevelopmentReserve,
    client3,
  } = getDefaultWallets(wallets);

  beforeEach(async function () {
    // given
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

  describe('Basic token tests', () => {
    it('should provide correct total supply', async function () {
      const actualTotalSupply = (await this.token.totalSupply()).toNumber();
      assertEqual(
        actualTotalSupply,
        totalSupply.sub(
          reservedTokensPreIco,
        ).sub(reservedTokensIco).sub(reservedTokensIcoBonuses).toNumber(),
      );
    });

    it('should transfer tokens to another account', async function () {
      await this.token.transfer(
        client3,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      const actualFoundersBalance = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualFoundersBalance,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const actualClientBalance = (await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        actualClientBalance,
        validAmountForFoundersFoundation.toNumber(),
      );
    });

    it('should not transfer tokens to 0x0 address', async function () {
      const transfer = this.token.transfer(
        0x0,
        validAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      await transfer.should.be.rejectedWith(EVMThrow);

      const actualReservedTokensForFounders = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(actualReservedTokensForFounders, reservedTokensForFoundersFoundation.toNumber());
    });

    it('should not transfer tokens if sender does not have enough tokens', async function () {
      const transfer = this.token.transfer(
        client3,
        invalidAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      await transfer.should.be.rejectedWith(EVMThrow);

      const actualFoundersBalance = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        actualFoundersBalance,
        reservedTokensForFoundersFoundation.toNumber(),
      );
    });
  });
});
