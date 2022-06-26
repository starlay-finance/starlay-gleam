/* eslint-disable camelcase */
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import {
  Distributor,
  Distributor__factory,
  MintableERC20,
  MintableERC20__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../typechain";
import { expect } from "chai";
describe("Distributor", function () {
  let target: Distributor;
  let rewardToken: MintableERC20;
  this.beforeAll(async () => {
    const [deployer] = await ethers.getSigners();
    rewardToken = await new MintableERC20__factory(deployer).deploy(
      "test",
      "TST"
    );
    await rewardToken.mint(parseEther("10000"));
    target = await new Distributor__factory(deployer).deploy(
      rewardToken.address
    );
    await rewardToken.transfer(target.address, parseEther("10000"));
  });
  it("Should be added distrobutees", async () => {
    const [, user1, user2, user3] = await ethers.getSigners();
    await target.addDistributions(
      [
        await user1.getAddress(),
        await user2.getAddress(),
        await user3.getAddress(),
      ],
      [parseEther("1"), parseEther("2"), parseEther("3")]
    );
    expect(await target.distributeeIdx()).to.be.eq(3);
    expect((await target.distributionAmount(1)).account).to.be.eq(
      await user1.getAddress()
    );
    expect((await target.distributionAmount(2)).account).to.be.eq(
      await user2.getAddress()
    );
    expect((await target.distributionAmount(3)).account).to.be.eq(
      await user3.getAddress()
    );
    expect((await target.distributionAmount(1)).amount).to.be.eq(
      parseEther("1")
    );
    expect((await target.distributionAmount(2)).amount).to.be.eq(
      parseEther("2")
    );
    expect((await target.distributionAmount(3)).amount).to.be.eq(
      parseEther("3")
    );
  });

  it("Should be added more distrobutees", async () => {
    const [, , , , user4, user5, user6] = await ethers.getSigners();
    await target.addDistributions(
      [
        await user4.getAddress(),
        await user5.getAddress(),
        await user6.getAddress(),
      ],
      [parseEther("4"), parseEther("5"), parseEther("6")]
    );
    expect(await target.distributeeIdx()).to.be.eq(6);
    expect((await target.distributionAmount(4)).account).to.be.eq(
      await user4.getAddress()
    );
    expect((await target.distributionAmount(5)).account).to.be.eq(
      await user5.getAddress()
    );
    expect((await target.distributionAmount(6)).account).to.be.eq(
      await user6.getAddress()
    );
    expect((await target.distributionAmount(4)).amount).to.be.eq(
      parseEther("4")
    );
    expect((await target.distributionAmount(5)).amount).to.be.eq(
      parseEther("5")
    );
    expect((await target.distributionAmount(6)).amount).to.be.eq(
      parseEther("6")
    );
  });
  it("Should be 21, total distribution amount", async () => {
    expect(await target.totalDistributionAmount()).to.be.eq(parseEther("21"));
  });

  it("Should be distributed with idx", async () => {
    await target.distributeTo(2);
    const [, user1, user2, user3] = await ethers.getSigners();
    expect(await rewardToken.balanceOf(await user1.getAddress())).to.be.eq(
      parseEther("1")
    );
    expect(await rewardToken.balanceOf(await user2.getAddress())).to.be.eq(
      parseEther("2")
    );
    expect(await rewardToken.balanceOf(await user3.getAddress())).to.be.eq(
      parseEther("0")
    );
  });
  it("Should be distributed", async () => {
    await target.distribute();
    const [, user1, user2, user3, user4, user5, user6] =
      await ethers.getSigners();
    expect(await rewardToken.balanceOf(await user1.getAddress())).to.be.eq(
      parseEther("1")
    );
    expect(await rewardToken.balanceOf(await user2.getAddress())).to.be.eq(
      parseEther("2")
    );
    expect(await rewardToken.balanceOf(await user3.getAddress())).to.be.eq(
      parseEther("3")
    );
    expect(await rewardToken.balanceOf(await user4.getAddress())).to.be.eq(
      parseEther("4")
    );
    expect(await rewardToken.balanceOf(await user5.getAddress())).to.be.eq(
      parseEther("5")
    );
    expect(await rewardToken.balanceOf(await user6.getAddress())).to.be.eq(
      parseEther("6")
    );
  });
});
