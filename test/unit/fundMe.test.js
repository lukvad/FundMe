const { assert, expect } = require("chai")
const {deployments, ethers, getNamedAccounts} = require("hardhat")

describe("FundMe", async()=>{
    let fundMe
    let deployer
    let mockV3Aggregator
    let sendValue = ethers.parseEther("1")
    beforeEach(async()=>{
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
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
            let e = "";
            try{
                await fundMe.fund()
            }catch(error){
                e=error
            }
            assert.include(e.toString(),"Didn't send enough")
        })
        it("updates the amount funded data structure", async()=> {
            await fundMe.fund({value: sendValue})
            const response = await fundMe.addressToAmount(
                deployer
            )
            assert.equal(sendValue.toString(),response.toString())
        })
        it("adds funder into arrays of funders",async ()=> {
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })
    describe("withdraw", ()=>{
        beforeEach(async()=>{
            await fundMe.fund({value:sendValue})
        })
        it("withdraw ETH from a single founder",async ()=>{
            //Arrange
            const startContractBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            )

            const startDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            //Act
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            const {gasPrice, gasUsed} = txReceipt
            const gasCost = gasPrice * gasUsed
            const endContractBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            )
            const endDeployerBalance = await ethers.provider.getBalance(
                deployer
            )       
            //Assert
            assert.equal(endContractBalance, 0)
            assert.equal((startContractBalance + startDeployerBalance).toString(), (endDeployerBalance + gasCost).toString())
        })
        it("allows us to withdraw multiple funders", async ()=> {
            //Arrange
            const accounts = await ethers.getSigners();
            for (let i=1;i<6;i++){
                const fundMeMultiple = await fundMe.connect(accounts[i])
                await fundMeMultiple.fund({value: sendValue})
            }
            const startContractBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            )
            const startDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            //Act
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            const {gasPrice, gasUsed} = txReceipt
            const gasCost = gasPrice * gasUsed
            const endContractBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            )
            const endDeployerBalance = await ethers.provider.getBalance(
                deployer
            )   
            //Assert
            assert.equal(endContractBalance, 0)
            assert.equal((startContractBalance + startDeployerBalance).toString(), (endDeployerBalance + gasCost).toString())
            let e = false;
            try{
                await fundMe.funders(0)
            }catch(error){
                e=error
            }
            assert.isNotEmpty(e)
            for(let i=0;i<6;i++){
                assert.equal(
                    await fundMe.addressToAmount(accounts[i].address),
                    0
                )
            }
        })
        it("only allows the owner to withdraw", async ()=> {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnected =  await fundMe.connect(
                attacker
            )
            let e=false
            try{
                await attackerConnected.withdraw()
            }catch(error){
                e=error
            }
            assert.include(e.toString(),"FundMe__NotOwner()")
        })
    })
})