// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./PriceConverter.sol";
//681685
error NotOwner();
contract FundMe {
    using PriceConverter for uint256;
    uint256 public constant MINIMUM_USD = 5 * 1e18;
    address[] public funders;
    mapping (address => uint256) public addressToAmount;
    address public immutable i_owner;

    constructor(){
        i_owner = msg.sender;
    }

    function fund() public payable {
        require(msg.value.getConversionRate() >= MINIMUM_USD, "Didn't send enough");
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
    receive () external payable {
        fund();
    }
    fallback () external payable {
        fund();
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "You are not allowed");
        if(msg.sender != i_owner){revert NotOwner();}
        _;
    }

}