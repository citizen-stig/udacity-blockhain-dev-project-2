// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    // Star data
    struct Star {
        string name;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    mapping(string => uint) private claimedStars;

    constructor() ERC721("Nikolai Golub Star Notary Token", "NGSNT") public {
    }

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        require(bytes(_name).length > 0, "Star name cannot be empty");
        require(claimedStars[_name] == 0, "Star with this name already claimed");
        claimedStars[_name] = 1;
        tokenIdToStarInfo[_tokenId] = newStar;
        _safeMint(msg.sender, _tokenId);
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transfer(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUpTokenIdToStarInfo(uint _tokenId) public view returns (string memory) {
        Star memory existingStar = tokenIdToStarInfo[_tokenId];
        require(bytes(existingStar.name).length > 0, "The star with given id is not found");
        return existingStar.name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address owner1Address = ownerOf(_tokenId1);
        address owner2Address = ownerOf(_tokenId2);
        require(owner1Address == msg.sender || owner2Address == msg.sender, "Only owner can exchange stars");
        _transfer(owner1Address, owner2Address, _tokenId1);
        _transfer(owner2Address, owner1Address, _tokenId2);
    }

    function transferStar(address _to1, uint256 _tokenId) public {
        transferFrom(msg.sender, _to1, _tokenId);
    }

}
