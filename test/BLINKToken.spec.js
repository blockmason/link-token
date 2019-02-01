/* global artifacts, contract */
/* eslint-disable no-magic-numbers */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const BLINKToken = artifacts.require('BLINKToken');
const { expect } = chai.use(chaiAsPromised);

const expectEvent = async (promise, expectedEvent) => {
  const { logs: [{ event: actualEvent }] } = await promise;
  expect(actualEvent).to.equal(expectedEvent);
};

const expectNumber = async (promise, value) => expect(await promise.then((v) => v.toString())).to.equal(new BN(value).toString());

const expectRevert = (promise) => expect(promise).to.eventually.be.rejectedWith(Error, /revert$/g);

const ZERO_ADDRESS = `0x${Buffer.alloc(20).toString('hex')}`;

contract('BLINKToken', (accounts) => {
  const [alice, bob] = accounts;

  describe('Constants:', () => {
    describe('#decimals', () => {
      it('is 18', async () => {
        const contract = await BLINKToken.new();
        return expectNumber(contract.decimals(), 18);
      });
    });

    describe('#name', () => {
      it('is "BLOCKMASON LINK TOKEN"', async () => {
        const contract = await BLINKToken.new();
        const name = await contract.name();
        expect(name).to.equal('BLOCKMASON LINK TOKEN');
      });
    });

    describe('#symbol', () => {
      it('is "BLINK"', async () => {
        const contract = await BLINKToken.new();
        const symbol = await contract.symbol();
        expect(symbol).to.equal('BLINK');
      });
    });
  });

  describe('Fields:', () => {
    describe('#mintingFinished', () => {
      it('is false', async () => {
        const contract = await BLINKToken.new();
        const isMintingFinished = await contract.mintingFinished();
        expect(isMintingFinished).to.be.false;
      });
    });

    describe('#owner', () => {
      it('is the creator', async () => {
        const contract = await BLINKToken.new({ from: alice });
        const owner = await contract.owner();
        expect(owner).to.equal(alice);
      });
    });

    describe('#totalSupply', () => {
      it('is 0', async () => {
        const contract = await BLINKToken.new();
        return expectNumber(contract.totalSupply(), 0);
      });
    });
  });

  describe('Functions:', () => {
    describe('#finishMinting()', () => {
      it('reverts the transaction if called by a non-owner', async () => {
        const contract = await BLINKToken.new({ from: alice });
        return expectRevert(contract.finishMinting({ from: bob }));
      });

      it('sets #mintingFinished to true', async () => {
        const contract = await BLINKToken.new();

        await contract.finishMinting();
        const isMintingFinished = await contract.mintingFinished();

        expect(isMintingFinished).to.be.true;
      });

      it('emits a MintFinished event', async () => {
        const contract = await BLINKToken.new();

        return expectEvent(contract.finishMinting(), 'MintFinished');
      });
    });

    describe('#transfer()', () => {
      describe('before minting has finished', () => {
        it('reverts the transaction', async () => {
          const contract = await BLINKToken.new();

          await contract.mint(alice, 123, { from: alice });

          return expectRevert(contract.transfer(bob, 123, { from: alice }));
        });
      });

      describe('after minting has finished', () => {
        describe('when sender balance == 0', () => {
          describe('when amount == 0', () => {
            it('emits a Transfer event', async () => {
              const contract = await BLINKToken.new();

              await contract.finishMinting();

              return expectEvent(contract.transfer(bob, 0, { from: alice }), 'Transfer');
            });

            it('does not update the sender balance', async () => {
              const contract = await BLINKToken.new();

              await contract.finishMinting();
              await contract.transfer(bob, 0, { from: alice });

              return expectNumber(contract.balanceOf(alice), 0);
            });

            it('does not update the recipient balance', async () => {
              const contract = await BLINKToken.new();

              await contract.finishMinting();
              await contract.transfer(bob, 0, { from: alice });

              return expectNumber(contract.balanceOf(bob), 0);
            });
          });

          describe('when amount > 0', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              await contract.finishMinting();

              return expectRevert(contract.transfer(bob, 1, { from: alice }));
            });
          });
        });

        describe('when recipient is the zero address', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new();

            await contract.mint(alice, 123, { from: alice });
            await contract.finishMinting();

            return expectRevert(contract.transfer(ZERO_ADDRESS, 123, { from: alice }));
          });
        });

        describe('when recipient is the contract address', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new();

            await contract.mint(alice, 123, { from: alice });
            await contract.finishMinting();

            return expectRevert(contract.transfer(contract.address, 123, { from: alice }));
          });
        });

        describe('when recipient is the sender address', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new();

            await contract.mint(alice, 123, { from: alice });
            await contract.finishMinting();

            return expectRevert(contract.transfer(alice, 123, { from: alice }));
          });
        });

        it('emits a Transfer event', async () => {
          const contract = await BLINKToken.new();

          await contract.mint(alice, 123, { from: alice });
          await contract.finishMinting();

          return expectEvent(contract.transfer(bob, 123, { from: alice }), 'Transfer');
        });

        it('updates the sender balance', async () => {
          const contract = await BLINKToken.new();

          await contract.mint(alice, 123, { from: alice });
          await contract.finishMinting();
          await contract.transfer(bob, 123, { from: alice });

          return expectNumber(contract.balanceOf(alice), 0);
        });

        it('updates the recipient balance', async () => {
          const contract = await BLINKToken.new();

          await contract.mint(alice, 123, { from: alice });
          await contract.finishMinting();
          await contract.transfer(bob, 123, { from: alice });

          return expectNumber(contract.balanceOf(bob), 123);
        });
      });
    });
  });
});
