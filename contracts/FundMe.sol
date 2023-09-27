// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

//Imports
import "./PriceConverter.sol";
import "hardhat/console.sol";

//Errors
error FundMe__NotOwner();
error Failed_Withdrawal();
error Sent_NotEnough();


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
    address[] private s_funders;
    mapping (address => uint256) private s_addressToAmount;
    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    //Modifier restricting function for the owner of contract
    modifier onlyOwner {
        if(msg.sender != i_owner){
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress){
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
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
        if(msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD){
            revert Sent_NotEnough();
        }
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] = msg.value;
        // console.log("Recieved", msg.value);
    }
    function withdraw() onlyOwner public {
        address[] memory m_funders = s_funders;
        for(uint f=0;f<m_funders.length;f++) {
            address funder = m_funders[f];
            s_addressToAmount[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        if(!callSuccess){
            revert Failed_Withdrawal();
        }

    }
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
    function getOwner() public view returns (address) {
        return i_owner;
    }
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }
    function getAddressToAmount(address funder) public view returns(uint256){
        return s_addressToAmount[funder];
    }
}