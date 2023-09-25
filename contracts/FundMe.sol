// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

//Imports
import "./PriceConverter.sol";

//Errors
error FundMe__NotOwner();

/**
 * @title A contract for crowdfunding
 * @author Alior
 * @notice This is only for training purposes
 * @dev This is implementing hardhat library
 */
contract FundMe {
    //Type declarations
    using PriceConverter for uint256;
    //State Variables
    uint256 public constant MINIMUM_USD = 5 * 1e18;
    address[] public funders;
    mapping (address => uint256) public addressToAmount;
    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    //Modifier restricting function for the owner of contract
    modifier onlyOwner {
        // require(msg.sender == i_owner, "You are not allowed");
        if(msg.sender != i_owner){revert FundMe__NotOwner();}
        _;
    }

    constructor(address priceFeedAddress){
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    receive () external payable {
        fund();
    }
    fallback () external payable {
        fund();
    } 
    /**
     * @notice This function funds the contract
     */
    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "Didn't send enough");
        funders.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }
    function withdraw() onlyOwner public {
        for(uint f=0;f<funders.length;f++) {
            address funder = funders[f];
            addressToAmount[funder] = 0;
        }
        funders = new address[](0);
        // payable(msg.sender).transfer(address(this).balance);
        // bool sendReq =  payable(msg.sender).send(address(this).balance);
        // require(sendReq, "Send failed");
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Transfer failed");

    }
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}