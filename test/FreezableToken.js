import { EVMThrow, assertTrue, assertFalse } from './utils';
import { getDefaultWallets } from './utils/constants';

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

  describe('Freezable token tests', () => {
    it('should add wallets to the frozenlist', async function () {
      await this.token.freezeAccount(foundersFoundationReserve, { from: owner });

      const afterAdd = await this.token.isFrozen(foundersFoundationReserve);
      assertTrue(afterAdd);
    });

    it('should reject request for add wallet to the frozenlist if sender uses 0x0 address as a wallet', async function () {
      const frozenlist = this.token.freezeAccount(0x0, { from: owner });

      await frozenlist.should.be.rejectedWith(EVMThrow);
    });

    it('should reject request for add wallet to the frozenlist if sender is not an owner', async function () {
      const frozenlist = this.token.freezeAccount(foundersFoundationReserve, { from: client3 });

      await frozenlist.should.be.rejectedWith(EVMThrow);

      const afterReject = await this.token.isFrozen(foundersFoundationReserve);
      assertFalse(afterReject);
    });

    it('should remove wallets from the frozenlist', async function () {
      await this.token.freezeAccount(foundersFoundationReserve, { from: owner });

      await this.token.unfreezeAccount(foundersFoundationReserve, { from: owner });

      const afterRemove = await this.token.isFrozen(foundersFoundationReserve);
      assertFalse(afterRemove);
    });

    it('should reject request for remove wallet from the frozenlist if sender uses 0x0 address as a wallet', async function () {
      const frozenlist = this.token.unfreezeAccount(0x0, { from: owner });

      await frozenlist.should.be.rejectedWith(EVMThrow);
    });

    it('should reject request for remove wallet from the frozenlist if sender is not an owner', async function () {
      await this.token.freezeAccount(foundersFoundationReserve, { from: owner });

      const frozenlist = this.token.unfreezeAccount(foundersFoundationReserve, { from: client3 });

      await frozenlist.should.be.rejectedWith(EVMThrow);

      const afterReject = await this.token.isFrozen(foundersFoundationReserve);
      assertTrue(afterReject);
    });
  });
});
