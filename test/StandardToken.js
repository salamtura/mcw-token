import { EVMThrow, assertEqual } from './utils';
import {
  ether1,
  reservedTokensForFoundersFoundation,
  validAmountForFoundersFoundation,
  invalidAmountForFoundersFoundation,
  getDefaultWallets,
} from './utils/constants';

const MocrowCoin = artifacts.require('MocrowCoin');

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
    client3,
  } = getDefaultWallets(wallets);

  const allowAmount = validAmountForFoundersFoundation.div(2);

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

    await this.token.approve(client3, allowAmount, { from: foundersFoundationReserve });
  });

  describe('Standard token tests', () => {
    it('should set allowable amount of tokens for a spender', async function () {
      const allowance = (await this.token.allowance(owner, client3)).toNumber();
      assertEqual(allowance, allowAmount.toNumber());
    });

    it('should increase allowed amount of tokens for a spender', async function () {
      await this.token.increaseApproval(client3, allowAmount, { from: foundersFoundationReserve });

      const allowance = (
        await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(allowance, allowAmount.add(allowAmount).toNumber());
    });

    it('should decrease allowed amount of tokens for a spender', async function () {
      await this.token.decreaseApproval(client3, allowAmount, { from: owner });

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(
        allowance,
        allowAmount.sub(allowAmount).toNumber(),
      );
    });

    it('should decrease allowed amount of tokens to 0 for a spender if sender uses too much value while decrease', async function () {
      await this.token.decreaseApproval(client3, allowAmount, { from: foundersFoundationReserve });

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(allowance, 0);
    });

    it('should transfer tokens from one account to another', async function () {
      await this.token.transferFrom(
        foundersFoundationReserve,
        client3,
        allowAmount,
        { from: client3 },
      );

      const actualBalance = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(actualBalance, reservedTokensForFoundersFoundation.sub(allowAmount).toNumber());

      const clientBalance = (await this.token.balanceOf(client3)).toNumber();
      assertEqual(
        clientBalance,
        allowAmount.toNumber(),
      );

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(
        allowance,
        allowAmount.sub(allowAmount).toNumber(),
      );
    });

    it('should not transfer tokens from one account to another if token holder does not have enough tokens', async function () {
      await this.token.transfer(
        platformOperationsReserve,
        invalidAmountForFoundersFoundation.sub(ether1).sub(ether1),
        { from: foundersFoundationReserve },
      );
      const balance = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();

      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        client3,
        allowAmount,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualBalance = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(actualBalance, balance);

      const ClientBalance = (await this.token.balanceOf(client3)).toNumber();
      assertEqual(ClientBalance, 0);

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(allowance, allowAmount.toNumber());
    });

    it('should not transfer tokens from one account to another if sender does not have enough allowance', async function () {
      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        client3,
        invalidAmountForFoundersFoundation,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualBalance = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(actualBalance, reservedTokensForFoundersFoundation.toNumber());

      const clientBalance = (await this.token.balanceOf(client3)).toNumber();
      assertEqual(clientBalance, 0);

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(allowance, allowAmount.toNumber());
    });

    it('should not transfer tokens from one account to another if sender uses 0x0 address as destination account', async function () {
      const transferFrom = this.token.transferFrom(
        foundersFoundationReserve,
        0x0,
        allowAmount,
        { from: client3 },
      );

      await transferFrom.should.be.rejectedWith(EVMThrow);

      const actualBalance = (await this.token.balanceOf(foundersFoundationReserve)).toNumber();
      assertEqual(actualBalance, reservedTokensForFoundersFoundation.toNumber());

      const allowance = (await this.token.allowance(foundersFoundationReserve, client3)).toNumber();
      assertEqual(allowance, allowAmount.toNumber());
    });
  });
});
