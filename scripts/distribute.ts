/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
/* eslint-disable camelcase */
import { Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Distributor__factory } from "../typechain";

const main = async () => {
  await distribute();
};

const distribute = async () => {
  const signer = new Wallet("PRIVATE_KEY", new JsonRpcProvider("RPC_URL"));
  const distrobutor = Distributor__factory.connect(
    "DISTRIBUTOR_ADDRESS",
    signer
  );

  const distributed = await distrobutor.distributedIdx();
  const distributee = await distrobutor.distributeeIdx();
  const perTx = 90;
  for (let i = distributed.toNumber(); i < distributee.toNumber(); ) {
    console.log("start index:", i.toString());
    const to =
      i + perTx <= distributee.toNumber()
        ? perTx
        : distributee.toNumber() - distributed.toNumber();
    try {
      const tx = await distrobutor.distributeTo(to, {
        gasPrice: 20 * 1000000000,
      });
      await tx.wait(1);
      i = i + to;
    } catch (e) {
      const tx = await distrobutor.distributeTo(to, {
        gasPrice: 20 * 1000000000,
      });
      await tx.wait(1);
      i = i + to;
    }
  }
};

main();
