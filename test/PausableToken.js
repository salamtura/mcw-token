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

  describe('Pausable Token tests', () => {
    it('should be in unpaused state', async function () {
      // then
      const paused = await this.token.paused();
      assertFalse(paused);
    });

    it('should set paused state', async function () {
      // when
      await this.token.pause({ from: owner });

      // then
      const stateAfterUnpause = await this.token.paused();
      assertTrue(stateAfterUnpause);
    });

    it('should set unpaused state', async function () {
      // given
      await this.token.pause({ from: owner });

      // when
      await this.token.unpause({ from: owner });

      // then
      const paused = await this.token.paused();
      assertFalse(paused);
    });

    it('should reject the request for setting of pause state if sender is not an owner', async function () {
      // when
      const pause = this.token.pause({ from: client3 });

      // then
      await pause.should.be.rejectedWith(EVMThrow);

      const stateAfterRejectedUnpause = await this.token.paused();
      assertFalse(stateAfterRejectedUnpause);
    });

    it('should reject the request for setting of unpause state if sender is not an owner', async function () {
      // given
      await this.token.pause({ from: owner });

      // when
      const unpause = this.token.unpause({ from: client3 });

      // then
      await unpause.should.be.rejectedWith(EVMThrow);

      const stateAfterRejectedPause = await this.token.paused();
      assertTrue(stateAfterRejectedPause);
    });
  });
});
