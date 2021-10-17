const { getDefaultProvider } = require("@ethersproject/providers");
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");


describe("Init", function () {
  it("Deploy", async function () {
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();
    await nft.deployed();

    expect(await nft.name()).to.equal("tenmilliondollars.art-Tiago");
  });
});

describe("Minting", () => {

  it("Mint: correct id", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();
    await nft.deployed();

    await nft.connect(addr1).mint({value: ethers.utils.parseEther('3')});

    const new_id = await nft.tokenOfOwnerByIndex(addr1.address, 2);
    expect(new_id).to.equal(3, "Incorrect token ID");
  });

  it("Mint: tokenURI", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();

    await nft.connect(addr1).mint({value: ethers.utils.parseEther('3')});

    const _uri1 = "https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tenmilliondollars-1.json";
    const _uri2 = "https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tenmilliondollars-2.json";
    const uri1 = await nft.tokenURI(1);
    const uri2 = await nft.tokenURI(2);
    const ownerOf3 = await nft.ownerOf(3);
    expect(_uri1).to.equal(uri1, "Incorrect tokenURI(1)");
    expect(_uri2).to.equal(uri2, "Incorrect tokenURI(1)");
    expect(ownerOf3).to.equal(addr1.address, "Incorrect owner");
  });

  it("Mint > max id : correct last ID + revert on id11", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();

    for(let i=0; i<10; i++) await nft.connect(addr1).mint({value: ethers.utils.parseEther('1')});
    
    const _uri10 = "https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tenmilliondollars-10.json";
    const uri10 = await nft.tokenURI(10);
    expect(_uri10).to.equal(uri10, "Incorrect tokenURI(10)");
    expect(nft.connect(addr1).mint({value: ethers.utils.parseEther('1')})).to.be.revertedWith("Sold out");
  });

  it("Mint > max value", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();
    const provider = await waffle.provider;

    const bal_before = await provider.getBalance(addr1.address);
    await nft.connect(addr1).mint({value: ethers.utils.parseEther('11')});
    const bal_after = await provider.getBalance(addr1.address);
    const delta = bal_before.sub(bal_after);

    const _uri10 = "https://tenmilliondollars.art/wp-content/uploads/sites/2/nft/metadata/tenmilliondollars-10.json";
    const uri10 = await nft.tokenURI(10);
    expect(_uri10).to.equal(uri10, "Incorrect tokenURI(10)");
    expect(delta).to.be.closeTo(ethers.utils.parseEther('10'), ethers.utils.parseEther('0.09'));
    console.log("total paid (should be close to 10eth, since 1 is back) : "+delta.toString());
  });
})

describe("Withdraw", () => {
  it("Withdraw balance", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const provider = await waffle.provider;
    const nft = await Fact.deploy();

    for(let i=0; i<10; i++) await nft.connect(addr1).mint({value: ethers.utils.parseEther('1')});

    const bal_before = await provider.getBalance(owner.address);
    await nft.connect(owner).withdraw();
    const bal_after = await provider.getBalance(owner.address);
    const delta = bal_after.sub(bal_before);

    const new_contract_balance = await provider.getBalance(nft.address);

    expect(delta).to.be.closeTo(ethers.utils.parseEther('10'), ethers.utils.parseEther('0.09'));
    expect(new_contract_balance).to.equal(0);
  });

  it("Transfer ownership + Withdraw unauth", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Fact = await ethers.getContractFactory("tenmilliondollars");
    const nft = await Fact.deploy();
    const provider = await waffle.provider;

    for(let i=0; i<10; i++) await nft.connect(addr1).mint({value: ethers.utils.parseEther('1')});

    await nft.transferOwnership(addr1.address);

    expect(nft.connect(owner).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");


    const bal_before = await provider.getBalance(addr1.address);
    await nft.connect(addr1).withdraw();
    const bal_after = await provider.getBalance(addr1.address);
    const delta = bal_after.sub(bal_before);

    const new_contract_balance = await provider.getBalance(nft.address);

    expect(delta).to.be.closeTo(ethers.utils.parseEther('10'), ethers.utils.parseEther('0.09'));
    expect(new_contract_balance).to.equal(0);
    
  });

})