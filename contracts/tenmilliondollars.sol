// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title 10 millions $ NFT
 * @dev Extends ERC721 Non-Fungible Token Standard basic implementation
 */

contract tenmilliondollars is ERC721Enumerable, Ownable {

    uint256 public constant price = 800 * 10**18; // CHANGE ME 800 Matic
    uint256 public constant maxMint = 10_000; // CHANGE ME 10_000
    bool public active = true;
    string _contractURI = "https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tiago_nft_contract_metadata.json";

    constructor() ERC721("tenmilliondollars.art-Tiago", "10M$ART-TIAGO") {}

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function saleStatus() public onlyOwner {
        active = !active;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked("https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tenmilliondollars-", uint2str(tokenId), ".json"));
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setContractURI(string calldata _newURI) public onlyOwner {
        _contractURI = _newURI;
    }

    function mint() public payable {
        require(active, "Not active");
        require(totalSupply() < maxMint, "Sold out");  //totalSupply = tokenOwners.length

        uint256 amount_left = msg.value;
        uint256 mintIndex = totalSupply()+1;

        while(amount_left >= price && mintIndex <= maxMint) {
            if (mintIndex <= maxMint) {
                amount_left = amount_left - price;
                _safeMint(msg.sender, mintIndex);
            }
            mintIndex = totalSupply()+1;
        }

        if(amount_left > 0) payable(msg.sender).transfer(amount_left);
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}