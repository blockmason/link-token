/* eslint-disable max-lines, no-magic-numbers */
/* global artifacts, contract */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const BLINKToken = artifacts.require('BLINKToken');
const { expect } = chai.use(chaiAsPromised);

const expectEvent = async (promise, expectedEvent) => {
  const { logs } = await promise;
  const actualEvents = logs.map((log) => log.event);
  expect(actualEvents).to.include(expectedEvent);
};

const expectNumber = async (promise, value) => expect(await promise.then((v) => v.toString())).to.equal(new BN(value).toString());

const expectRevert = (promise) => expect(promise).to.eventually.be.rejectedWith(Error, /revert$/g);

const ZERO_ADDRESS = `0x${Buffer.alloc(20).toString('hex')}`;
const MAX_UINT256_VALUE = new BN(Buffer.alloc(32).fill(0xFF));

contract('BLINKToken', (accounts) => {
  const [alice, bob] = accounts;

  describe('ERC20 Core:', () => {
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
      describe('#totalSupply', () => {
        it('defaults to 0', async () => {
          const contract = await BLINKToken.new();
          return expectNumber(contract.totalSupply(), 0);
        });
      });
    });

    describe('Functions:', () => {
      describe('Default:', () => {
        it('reverts the transaction', async () => {
          const contract = await BLINKToken.new();
          return expectRevert(contract.send(1));
        });
      });

      describe('Read-only:', () => {
        describe('#allowance()', () => {
          describe('when tokens allowed == 0', () => {
            it('is 0', async () => {
              const contract = await BLINKToken.new();

              return expectNumber(contract.allowance(alice, bob), 0);
            });
          });

          describe('when tokens allowed > 0', () => {
            it('is the number of allowed tokens', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, 10, { from: alice });

              return expectNumber(contract.allowance(alice, bob), 10);
            });
          });
        });

        describe('#balanceOf()', () => {
          describe('when balance == 0', () => {
            it('is 0', async () => {
              const contract = await BLINKToken.new();

              return expectNumber(contract.balanceOf(alice), 0);
            });
          });

          describe('when balance > 0', () => {
            it('is the balance', async () => {
              const contract = await BLINKToken.new({ from: alice });

              await contract.mint(alice, 123, { from: alice });

              return expectNumber(contract.balanceOf(alice), 123);
            });
          });
        });

        describe('#transferableTokens()', () => {
          describe('when minting has not finished', () => {
            describe('when balance == 0', () => {
              it('is 0', async () => {
                const contract = await BLINKToken.new();

                return expectNumber(contract.transferableTokens(bob), 0);
              });
            });

            describe('when balance > 0', () => {
              it('is 0', async () => {
                const contract = await BLINKToken.new();

                await contract.mint(bob, 1, { from: alice });

                return expectNumber(contract.transferableTokens(bob), 0);
              });
            });
          });

          describe('when minting has finished', () => {
            describe('when balance == 0', () => {
              it('is 0', async () => {
                const contract = await BLINKToken.new();

                await contract.finishMinting({ from: alice });

                return expectNumber(contract.transferableTokens(bob), 0);
              });
            });

            describe('when balance > 0', () => {
              it('is the balance', async () => {
                const contract = await BLINKToken.new();

                await contract.mint(bob, 1, { from: alice });
                await contract.finishMinting({ from: alice });

                return expectNumber(contract.transferableTokens(bob), 1);
              });
            });
          });
        });
      });

      describe('State-changing:', () => {
        describe('#approve()', () => {
          describe('when spender is the zero-address', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.approve(ZERO_ADDRESS, 1, { from: alice }));
            });
          });

          describe('when spender is the caller', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.approve(alice, 1, { from: alice }));
            });
          });

          describe('when amount == 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.approve(bob, 0, { from: alice }), 'Approval');
            });
          });

          describe('when amount > 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.approve(bob, 1, { from: alice }), 'Approval');
            });

            it('resets the allowance', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, 3, { from: alice });

              await contract.approve(bob, 1, { from: alice });

              return expectNumber(contract.allowance(alice, bob), 1);
            });
          });
        });

        describe('#decreaseApproval()', () => {
          describe('when spender is the zero-address', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.decreaseApproval(ZERO_ADDRESS, 0, { from: alice }));
            });
          });

          describe('when spender is the caller', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.decreaseApproval(alice, 0, { from: alice }));
            });
          });

          describe('when allowance would underflow', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.decreaseApproval(bob, 1, { from: alice }), 'Approval');
            });

            it('sets the allowance to 0', async () => {
              const contract = await BLINKToken.new();

              await contract.decreaseApproval(bob, 1, { from: alice });

              return expectNumber(contract.allowance(alice, bob), 0);
            });
          });

          describe('when amount == 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.decreaseApproval(bob, 0, { from: alice }), 'Approval');
            });
          });

          describe('when amount > 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, 1, { from: alice });

              return expectEvent(contract.decreaseApproval(bob, 1, { from: alice }), 'Approval');
            });

            it('decrements the allowance', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, 3, { from: alice });

              await contract.decreaseApproval(bob, 1, { from: alice });

              return expectNumber(contract.allowance(alice, bob), 2);
            });
          });
        });

        describe('#increaseApproval()', () => {
          describe('when spender is the zero-address', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.increaseApproval(ZERO_ADDRESS, 1, { from: alice }));
            });
          });

          describe('when spender is the caller', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              return expectRevert(contract.increaseApproval(alice, 1, { from: alice }));
            });
          });

          describe('when allowance would overflow', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, MAX_UINT256_VALUE, { from: alice });

              return expectRevert(contract.increaseApproval(bob, 1, { from: alice }));
            });
          });

          describe('when amount == 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.increaseApproval(bob, 0, { from: alice }), 'Approval');
            });
          });

          describe('when amount > 0', () => {
            it('emits an Approval event', async () => {
              const contract = await BLINKToken.new();

              return expectEvent(contract.increaseApproval(bob, 1, { from: alice }), 'Approval');
            });

            it('increments the allowance', async () => {
              const contract = await BLINKToken.new();

              await contract.approve(bob, 3, { from: alice });

              await contract.increaseApproval(bob, 1, { from: alice });

              return expectNumber(contract.allowance(alice, bob), 4);
            });
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

        describe('#transferFrom()', () => {
          describe('before minting has finished', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new({ from: alice });

              await contract.mint(alice, 1, { from: alice });
              await contract.approve(bob, 1, { from: alice });

              return expectRevert(contract.transferFrom(alice, bob, 1, { from: bob }));
            });
          });

          describe('after minting has finished', () => {
            describe('when transfering from the zero-address', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });

                return expectRevert(contract.transferFrom(ZERO_ADDRESS, bob, 1, { from: alice }));
              });
            });

            describe('when transfering from the contract address', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });

                return expectRevert(contract.transferFrom(contract.address, bob, 1, { from: alice }));
              });
            });

            describe('when transfering to the zero-address', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });

                return expectRevert(contract.transferFrom(alice, ZERO_ADDRESS, 1, { from: bob }));
              });
            });

            describe('when transfering to the contract address', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });

                return expectRevert(contract.transferFrom(alice, contract.address, 1, { from: bob }));
              });
            });

            describe('when transfering from and to the same address', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });

                return expectRevert(contract.transferFrom(alice, alice, 1, { from: bob }));
              });
            });

            describe('when transfer amount exceeds allowance', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 2, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });

                return expectRevert(contract.transferFrom(alice, bob, 2, { from: bob }));
              });
            });

            describe('when transfer amount exceeds sender balance', () => {
              it('reverts the transaction', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 2, { from: alice });

                return expectRevert(contract.transferFrom(alice, bob, 2, { from: bob }));
              });
            });

            describe('when transfer is successful', () => {
              it('updates the recipient balance', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });
                await contract.transferFrom(alice, bob, 1, { from: bob });

                return expectNumber(contract.balanceOf(bob), 1);
              });

              it('updates the sender balance', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });
                await contract.transferFrom(alice, bob, 1, { from: bob });

                return expectNumber(contract.balanceOf(alice), 0);
              });

              it('updates the caller allowance', async () => {
                const contract = await BLINKToken.new({ from: alice });

                await contract.mint(alice, 1, { from: alice });
                await contract.finishMinting({ from: alice });
                await contract.approve(bob, 1, { from: alice });
                await contract.transferFrom(alice, bob, 1, { from: bob });

                return expectNumber(contract.allowance(alice, bob), 0);
              });
            });
          });
        });
      });
    });
  });

  describe('Mintability', () => {
    describe('Fields:', () => {
      describe('#mintingFinished', () => {
        it('defaults to false', async () => {
          const contract = await BLINKToken.new();
          const isMintingFinished = await contract.mintingFinished();
          expect(isMintingFinished).to.be.false;
        });
      });
    });

    describe('Functions:', () => {
      describe('#finishMinting()', () => {
        describe('when called by non-owner', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new({ from: alice });

            return expectRevert(contract.finishMinting({ from: bob }));
          });
        });

        describe('when called by owner', () => {
          describe('after minting has finished', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new({ from: alice });

              await contract.finishMinting({ from: alice });

              return expectRevert(contract.finishMinting({ from: alice }));
            });
          });

          describe('before minting has finished', () => {
            it('sets #mintingFinished to true', async () => {
              const contract = await BLINKToken.new({ from: alice });

              await contract.finishMinting({ from: alice });
              const isMintingFinished = await contract.mintingFinished();

              expect(isMintingFinished).to.be.true;
            });

            it('emits a MintFinished event', async () => {
              const contract = await BLINKToken.new({ from: alice });

              return expectEvent(contract.finishMinting({ from: alice }), 'MintFinished');
            });
          });
        });
      });

      describe('#mint()', () => {
        describe('before minting has finished', () => {
          describe('when called by non-owner', () => {
            it('reverts the transaction', async () => {
              const contract = await BLINKToken.new({ from: alice });

              return expectRevert(contract.mint(alice, 1, { from: bob }));
            });
          });

          describe('when called by owner', () => {
            it('emits a Mint event', async () => {
              const contract = await BLINKToken.new({ from: alice });

              return expectEvent(contract.mint(alice, 1, { from: alice }), 'Mint');
            });

            it('emits a Transfer event', async () => {
              const contract = await BLINKToken.new({ from: alice });
              return expectEvent(contract.mint(alice, 1, { from: alice }), 'Transfer');
            });

            it('updates the recipient balance', async () => {
              const contract = await BLINKToken.new({ from: alice });

              await contract.mint(alice, 1, { from: alice });

              return expectNumber(contract.balanceOf(alice), 1);
            });
          });
        });

        describe('after minting has finished', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new({ from: alice });

            await contract.finishMinting({ from: alice });

            return expectRevert(contract.mint(alice, 1, { from: alice }));
          });
        });
      });
    });
  });

  describe('Ownership', () => {
    describe('Fields:', () => {
      describe('#owner', () => {
        it('defaults to the creator', async () => {
          const contract = await BLINKToken.new({ from: alice });
          const owner = await contract.owner();
          expect(owner).to.equal(alice);
        });
      });
    });

    describe('Functions:', () => {
      describe('#transferOwnership()', () => {
        describe('when called by owner', () => {
          it('updates the owner', async () => {
            const contract = await BLINKToken.new({ from: alice });

            await contract.transferOwnership(bob, { from: alice });

            const owner = await contract.owner();
            expect(owner).to.equal(bob);
          });

          it('emits an OwnershipTransferred event', async () => {
            const contract = await BLINKToken.new({ from: alice });

            return expectEvent(contract.transferOwnership(bob, { from: alice }), 'OwnershipTransferred');
          });
        });

        describe('when called by non-owner', () => {
          it('reverts the transaction', async () => {
            const contract = await BLINKToken.new({ from: alice });
            return expectRevert(contract.transferOwnership(bob, { from: bob }));
          });
        });
      });
    });
  });
});
