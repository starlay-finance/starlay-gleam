/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-extraneous-import */
// eslint-disable-next-line camelcase
import { Distributor__factory } from "./../typechain/factories/Distributor__factory";
import { Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

async function main() {
  const signer = new Wallet("", new JsonRpcProvider(""));
  const dist = await new Distributor__factory(signer).deploy("TOKEN_ADDRESS");
  console.log("distributor deployed at :", dist.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
