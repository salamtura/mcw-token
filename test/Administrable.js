import {
  EVMThrow,
  assertEqual,
  assertTrue,
  assertFalse,
} from './utils';
import { getDefaultWallets } from './utils/constants';

const Administrable = artifacts.require('Administrable');

contract('Administrable', (wallets) => {
  const {
    owner,
    client1,
    client2,
    client3,
  } = getDefaultWallets(wallets);

  beforeEach(async function () {
    this.administrable = await Administrable.new({ from: owner });
  });

  describe('Administrable tests', () => {
    it('should have correct parameters after creation', async function () {
      const ownerAddress = await this.administrable.owner();
      assertEqual(ownerAddress, owner);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 0);
    });

    it('should add administrator', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });
      await this.administrable.addAdministrator(client2, { from: owner });

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 2);

      const client1AfterAdd = await this.administrable.isAdministrator(client1);
      assertTrue(client1AfterAdd);

      const client2AfterAdd = await this.administrable.isAdministrator(client2);
      assertTrue(client2AfterAdd);
    });

    it('should reject request for add administrator if sender uses 0x0 address as an administrator', async function () {
      const administrable = this.administrable.addAdministrator(0x0, { from: owner });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 0);
    });

    it('should reject request for add administrator if sender uses administrator address', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });

      const administrable = this.administrable.addAdministrator(client1, { from: owner });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 1);

      const client1AfterAdd = await this.administrable.isAdministrator(client1);
      assertTrue(client1AfterAdd);
    });

    it('should reject request for add administrator if sender is not an owner', async function () {
      const administrable = this.administrable.addAdministrator(client1, { from: client3 });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 0);

      const client1AfterReject = await this.administrable.isAdministrator(client1);
      assertFalse(client1AfterReject);
    });

    it('should remove administrator', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });
      await this.administrable.addAdministrator(client2, { from: owner });

      await this.administrable.removeAdministrator(client1, { from: owner });
      await this.administrable.removeAdministrator(client2, { from: owner });

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 0);

      const client1AfterRemove = await this.administrable.isAdministrator(client1);
      assertFalse(client1AfterRemove);

      const client2AfterRemove = await this.administrable.isAdministrator(client2);
      assertFalse(client2AfterRemove);
    });

    it('should reject request for remove administrator if sender uses 0x0 address as an administrator', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });

      const administrable = this.administrable.removeAdministrator(0x0, { from: owner });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 1);
    });

    it('should reject request for remove administrator if sender uses not administrator address', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });

      const administrable = this.administrable.removeAdministrator(client2, { from: owner });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 1);

      const client2AfterReject = await this.administrable.isAdministrator(client2);
      assertFalse(client2AfterReject);
    });

    it('should reject request for remove administrator if sender is not an owner', async function () {
      await this.administrable.addAdministrator(client1, { from: owner });

      const administrable = this.administrable.removeAdministrator(client1, { from: client3 });

      await administrable.should.be.rejectedWith(EVMThrow);

      const administratorsLength = (await this.administrable.administratorsLength()).toNumber();
      assertEqual(administratorsLength, 1);

      const client1AfterReject = await this.administrable.isAdministrator(client1);
      assertTrue(client1AfterReject);
    });
  });
});
