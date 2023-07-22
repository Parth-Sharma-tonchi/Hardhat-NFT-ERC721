const { developmentChains } = require("../../helper-hardhat.config");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft", async function () {
          let deployer, basicNft;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["BasicNft"]);
              basicNft = await ethers.getContract("BasicNft", deployer);
          });
          describe("constructor", function () {
              it("Should have the given token name and symbol", async function () {
                  const name = await basicNft.name();
                  const symbol = await basicNft.symbol();

                  assert.equal(name.toString(), "Dogie");
                  assert.equal(symbol.toString(), "Dog");
              });
              it("tokenCounter should be 0", async () => {
                  const tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "0");
              });
          });

          describe("mint NFT", function () {
              beforeEach(async () => {
                  const tx = await basicNft.mintNft();
                  await tx.wait(1);
              });
              it("Allows to mint an NFT and updates properly", async () => {
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(tokenCounter.toString(), "1");
              });
              it("show the correct balance and owner of the contract", async function () {
                  const owner = await basicNft.ownerOf(0);
                  const deployerBalance = await basicNft.balanceOf(deployer);
                  console.log(`onwer = ${owner}`);
                  console.log(`deployer = ${deployer}`);

                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(owner, deployer);
              });
          });
      });
