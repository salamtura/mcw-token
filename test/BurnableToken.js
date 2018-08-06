import { EVMThrow, assertEqual } from './utils';
import {
  reservedTokensForFoundersFoundation,
  validAmountForFoundersFoundation,
  invalidAmountForFoundersFoundation,
  totalSupplyToken,
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
  } = getDefaultWallets(wallets);

  beforeEach(async function () {
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

  describe('Burnable token tests', () => {
    it('should burn tokens', async function () {
      await this.token.burn(validAmountForFoundersFoundation, { from: foundersFoundationReserve });

      const balanceAfterBurn = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        balanceAfterBurn,
        reservedTokensForFoundersFoundation.sub(validAmountForFoundersFoundation).toNumber(),
      );

      const totalSupplyAfterBurn = (await this.token.totalSupply()).toNumber();
      assertEqual(
        totalSupplyAfterBurn,
        totalSupplyToken.sub(validAmountForFoundersFoundation).toNumber(),
      );
    });

    it('should not burn tokens if sender does not has enough tokens to be burned', async function () {
      const burn = this.token.burn(
        invalidAmountForFoundersFoundation,
        { from: foundersFoundationReserve },
      );

      await burn.should.be.rejectedWith(EVMThrow);

      const BalanceAfterBurn = (
        await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(
        BalanceAfterBurn,
        reservedTokensForFoundersFoundation.toNumber(),
      );

      const totalSupplyAfterBurn = (await this.token.totalSupply()).toNumber();
      assertEqual(
        totalSupplyAfterBurn,
        totalSupplyToken.toNumber(),
      );
    });
  });
});
