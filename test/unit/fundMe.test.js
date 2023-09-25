const { assert, expect } = require("chai")
const {deployments, ethers, getNamedAccounts} = require("hardhat")

describe("FundMe", async()=>{
    let fundMe
    let deployer
    let mockV3Aggregator
    beforeEach(async()=>{
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        // const afundMe = await deployments.get("FundMe");

        // fundMe = await ethers.getContractAt(
        //     afundMe.abi,
        //     afundMe.address
        //   );
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator", 
            deployer
        )
    })
    describe("constructor", async()=>{
        it("sets the aggregator addresses corretly", async()=>{
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })

    })
    describe("fund", async()=>{
        it("fails if you don't send enough ETH", async()=>{
            
        })
    })
})