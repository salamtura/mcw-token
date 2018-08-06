import { EVMThrow, assertEqual } from './utils';
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

  describe('Ownable token tests', () => {
    it('should set token creator as owner', async function () {
      // then
      const tokenOwner = await this.token.owner();
      assertEqual(tokenOwner, owner);
    });

    it('should transfer ownership to another account', async function () {
      // when
      await this.token.transferOwnership(client3, { from: owner });

      // then
      const tokenOwner = await this.token.owner();
      assertEqual(tokenOwner, client3);
    });

    it('should reject the request for transfer ownership if sender is not an owner', async function () {
      // when
      const transferOwnership = this.token.transferOwnership(
        client3, { from: furtherTechDevelopmentReserve },
      );

      // then
      await transferOwnership.should.be.rejectedWith(EVMThrow);

      const tokenOwner = await this.token.owner();
      assertEqual(tokenOwner, owner);
    });
  });
});
