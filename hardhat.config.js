require("@nomiclabs/hardhat-waffle")
// require("@nomiclabs/ethereum-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

const SEP_RPC_URL = process.env.SEP_RPC_URL
const POL_RPC_URL = process.env.POL_RPC_URL
const LOC_RPC_URL = process.env.LOC_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHSCAN_API_KEY = process.env.ETHSCAN_API_KEY
const POLSCAN_API_KEY = process.env.POLSCAN_API_KEY
const COINMKT_API_KEY = process.env.COINMKT_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        local: {
            url: LOC_RPC_URL,
            chainId: 31337,
        },
        sepolia: {
            url: SEP_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        polygon: {
            url: POL_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 137,
        },
    },
    etherscan: {
        apiKey: {
            mainnet: ETHSCAN_API_KEY,
            sepolia: ETHSCAN_API_KEY,
            polygon: POLSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        // currency: "USD",
        // coinmarketcap: COINMKT_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
