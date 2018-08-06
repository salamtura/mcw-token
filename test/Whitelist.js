import {
  EVMThrow,
  assertEqual,
  assertTrue,
  assertFalse,
} from './utils';
import { getDefaultWallets } from './utils/constants';

const Whitelist = artifacts.require('Whitelist');

contract('Whitelist', (wallets) => {
  const {
    owner,
    client2,
    client3,
    withdrawal1,
  } = getDefaultWallets(wallets);

  beforeEach(async function () {
    // given
    this.whitelist = await Whitelist.new({ from: owner });
  });

  describe('Whitelist tests', () => {
    it('should have correct parameters after creation', async function () {
      // then
      const ownerAddress = await this.whitelist.owner();
      assertEqual(ownerAddress, owner);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 0);
    });

    it('should add wallets to the whitelist', async function () {
      // when
      await this.whitelist.addWallet(client2, { from: owner });
      await this.whitelist.addWallet(client3, { from: owner });

      // then
      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 2);

      const client2AfterAdd = await this.whitelist.isWhitelisted(client2);
      assertTrue(client2AfterAdd);

      const client3AfterAdd = await this.whitelist.isWhitelisted(client3);
      assertTrue(client3AfterAdd);
    });

    it('should reject request for add wallet to the whitelist if sender uses 0x0 address as a wallet', async function () {
      // when
      const whitelist = this.whitelist.addWallet(0x0, { from: owner });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 0);
    });

    it('should reject request for add wallet to the whitelist if sender uses address of an already whitelisted wallet', async function () {
      // given
      await this.whitelist.addWallet(client2, { from: owner });

      // when
      const whitelist = this.whitelist.addWallet(client2, { from: owner });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 1);

      const afterAdd = await this.whitelist.isWhitelisted(client2);
      assertTrue(afterAdd);
    });

    it('should reject request for add wallet to the whitelist if sender is not an owner', async function () {
      // when
      const whitelist = this.whitelist.addWallet(client2, { from: withdrawal1 });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 0);

      const afterReject = await this.whitelist.isWhitelisted(client2);
      assertFalse(afterReject);
    });

    it('should remove wallets from the whitelist', async function () {
      // given
      await this.whitelist.addWallet(client2, { from: owner });
      await this.whitelist.addWallet(client3, { from: owner });

      // when
      await this.whitelist.removeWallet(client2, { from: owner });
      await this.whitelist.removeWallet(client3, { from: owner });

      // then
      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 0);

      const foundersAfterRemove = await this.whitelist.isWhitelisted(client2);
      assertFalse(foundersAfterRemove);

      const bountyProgramAfterRemove = await this.whitelist.isWhitelisted(client3);
      assertFalse(bountyProgramAfterRemove);
    });

    it('should reject request for remove wallet from the whitelist if sender uses 0x0 address as a wallet', async function () {
      // given
      await this.whitelist.addWallet(client2, { from: owner });

      // when
      const whitelist = this.whitelist.removeWallet(0x0, { from: owner });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 1);
    });

    it('should reject request for remove wallet from the whitelist if sender uses address of a not whitelisted wallet', async function () {
      // given
      await this.whitelist.addWallet(client2, { from: owner });

      // when
      const whitelist = this.whitelist.removeWallet(client3, { from: owner });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 1);

      const bountyProgramAfterReject = await this.whitelist.isWhitelisted(client3);
      assertFalse(bountyProgramAfterReject);
    });

    it('should reject request for remove wallet from the whitelist if sender is not an owner', async function () {
      // given
      await this.whitelist.addWallet(client2, { from: owner });

      // when
      const whitelist = this.whitelist.removeWallet(client2, { from: withdrawal1 });

      // then
      await whitelist.should.be.rejectedWith(EVMThrow);

      const whitelistLength = (await this.whitelist.whitelistLength()).toNumber();
      assertEqual(whitelistLength, 1);

      const foundersAfterReject = await this.whitelist.isWhitelisted(client2);
      assertTrue(foundersAfterReject);
    });
  });
});
