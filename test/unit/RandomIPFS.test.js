//This test is correct but doesn't work because deploy script of randomIpfsNft is not correct.

const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");
const { randomBytes } = require("ethers");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIPFSNft", () => {
          let deployer, RandomIPFSNft, VRFCoordinatorV2Mock;
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["RandomIpfsNft", "mocks"]);
              RandomIPFSNft = await ethers.getContract("RandomIpfsNft", deployer);
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
          });

          describe("constructor", () => {
              it("check the input parameters", async () => {
                  const tokenCounter = await RandomIPFSNft.getTokenCounter();
                  const DogTokenUris = await RandomIPFSNft.getDogTokenUris();

                  assert.equal(tokenCounter.toString(), "0");
                  assert(DogTokenUris.inludes("ipfs://"));
              });
          });

          describe("requestNft", () => {
              it("Reverts if Not ETH sent", async () => {
                  await expect(RandomIPFSNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NotEnoughToMintNft"
                  );
              });
              it("reverts if enough ETH not sent", async () => {
                  const fee = await RandomIPFSNft.getMintFee();
                  await expect(
                      RandomIPFSNft.requestNft({
                          value: fee.sub(ethers.utils.parseEthers("0.001")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NotEnoughToMintNft");
              });
              it("emits an event and kick off a random word", async () => {
                  const fee = await RandomIPFSNft.getMintFee();
                  await expect(RandomIPFSNft.requestNft({ value: fee.toString() })).to.emit(
                      RandomIPFSNft,
                      "Nft__requested"
                  );
              });

              describe("fulfillRandomWorks", () => {
                  it(" mints Nft after random number returned", async () => {
                      await new Promise(async (resolve, reject) => {
                          RandomIPFSNft.once("Nft__Minted", async () => {
                              try {
                                  const tokenUri = await RandomIPFSNft.tokenURI("0");
                                  const tokenCounter = await RandomIPFSNft.getTokenCounter();
                                  assert.equal(tokenUri.toString().includes("ipfs://"), true);
                                  assert.equal(tokenCounter.toString(), "1");

                                  resolve();
                              } catch (error) {
                                  console.log(error);
                                  reject(e);
                              }
                          });

                          try {
                              const fee = await RandomIPFSNft.getMintFee();
                              const requestedNftResponse = await RandomIPFSNft.requestNft({
                                  value: fee.toString(),
                              });
                              const requestedNftReceipt = await requestedNftResponse.wait(1);
                              await VRFCoordinatorV2Mock.fulfillRandomWords(
                                  requestedNftReceipt.events[1].args.requestId,
                                  RandomIPFSNft.address
                              );
                          } catch (error) {
                              console.log(error);
                              reject(error);
                          }
                      });
                  });
              });

              describe("getBreedFromModdedRng", () => {
                  it("should return a pug if moddedRng < 10", async () => {
                      const expectedValue = await RandomIPFSNft.getBreedFromModdedRng(8);
                      assert.equal("0", expectedValue.toString());
                  });
                  it("should return a shiba Inu if moddedRng > 10 && < 39", async () => {
                      const expectedValue = await RandomIPFSNft.getBreedFromModdedRng(34);
                      assert.equal("1", expectedValue.toString());
                  });
                  it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77);
                      assert.equal(2, expectedValue);
                  });
                  it("reverts if range is out of bounds", async () => {
                      await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                          "RandomIpfsNft__RangeOutOfBounds"
                      );
                  });
              });
          });
      });
