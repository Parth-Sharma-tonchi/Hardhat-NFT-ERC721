//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    string public constant TOKEN_URI = "";
    uint256 private s_tokencounter;

    constructor() ERC721("Dogie", "Dog") {
        s_tokencounter = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokencounter);
        s_tokencounter++;
    }

    function tokenURI(uint256 /*tokenId*/) public view override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokencounter;
    }
}
