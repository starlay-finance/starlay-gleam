import { expect } from "chai";
import { ethers } from "hardhat";

describe("Distributor", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy("Hello, world!");
    await distributor.deployed();

    expect(await distributor.greet()).to.equal("Hello, world!");

    const setDistributorTx = await distributor.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setDistributorTx.wait();

    expect(await distributor.greet()).to.equal("Hola, mundo!");
  });
});
