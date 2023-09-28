const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let sendValue = ethers.parseEther("0.004")
          beforeEach(async () => {
              const { deployer } = getNamedAccounts()
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async () => {
              const tx = await fundMe.fund({ value: sendValue })
              await tx.wait(1)
              const txResponse = await fundMe.withdraw()
              await txResponse.wait(2)
              const addr = await fundMe.getAddress()
              const endingBalance = await ethers.provider.getBalance(addr)
              // console.log(endingBalance);
              // console.log(addr);
              assert.equal(endingBalance.toString(), "0")
              done()
          }).timeout(100000)
      })
