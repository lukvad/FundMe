const { deployments, ethers, getNamedAccounts } = require("hardhat")

const main = async () => {
    const sendValue = ethers.parseEther("0.004")
    const { deployer } = await getNamedAccounts()
    await deployments.fixture("all")
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract ...")
    try {
        const txResponse = await fundMe.fund({ value: sendValue })
        const txReceipt = await txResponse.wait(1)
        console.log("Funded")
    } catch (e) {
        console.log(e)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
