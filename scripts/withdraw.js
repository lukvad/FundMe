const { deployments, ethers, getNamedAccounts } = require("hardhat")

const main = async () => {
    const sendValue = ethers.parseEther("0.001")
    const { deployer } = await getNamedAccounts()
    await deployments.fixture("all")
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Wihtdrawing...")
    try {
        const txResponse = await fundMe.withdraw()
        const txReceipt = await txResponse.wait(1)
        console.log("Withdrawed")
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
