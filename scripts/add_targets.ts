/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
/* eslint-disable camelcase */
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { ethers, Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Distributor, Distributor__factory } from "../typechain";
import { parseEther } from "ethers/lib/utils";
type Airdrop = {
  address: string;
  amount: number;
};

const main = async () => {
  await parseCsv();
};

const parseCsv = async () => {
  const csvFilePath = path.resolve(__dirname, "CSV.csv");
  const headers = ["address", "amount"];

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  parse(
    fileContent,
    {
      delimiter: ",",
      columns: headers,
    },
    (error, result: Airdrop[]) => {
      if (error) {
        console.error(error);
      }
      const signer = new Wallet("PRIVATE_KEY", new JsonRpcProvider("RPC_URL"));
      const distrobutor = Distributor__factory.connect(
        "DISTRIBUTOR_ADDRESS",
        signer
      );

      addTargets(result, distrobutor).then(() => console.log("finish"));
    }
  );
};

const arraySplit = <T = object>(array: T[], n: number): T[][] =>
  array.reduce(
    (acc: T[][], c, i: number) =>
      i % n ? acc : [...acc, ...[array.slice(i, i + n)]],
    []
  );

const addTargets = async (airdrops: Airdrop[], distributor: Distributor) => {
  let contractIdx = 980;
  for (let i = 980; i < airdrops.length; i++) {
    const am = await distributor.distributionAmount(contractIdx + 1);
    if (!ethers.utils.isAddress(airdrops[i].address)) {
      console.log("skip invalid address ", airdrops[i].address);
      i = i + 1;
    }
    if (am[0].toString().toLowerCase() !== airdrops[i].address.toLowerCase()) {
      console.log("invalid target:", airdrops[i].address, am[0]);
    }
    if (
      am[1].toString() !== parseEther(airdrops[i].amount.toString()).toString()
    ) {
      console.log(
        "invalid amount",
        airdrops[i].amount.toString(),
        am[1].toString()
      );
    }
    contractIdx++;
  }
  const drops = arraySplit(airdrops, 150);
  let count = 0;
  for (const drop of drops) {
    count++;
    if (count <= 6) {
      continue;
    }
    const target = drop.filter((d) => ethers.utils.isAddress(d.address));
    drop
      .filter((d) => !ethers.utils.isAddress(d.address))
      .forEach((d) => console.log("invalid address:", d.address));

    console.log("register start count:", count);
    const transaction = await distributor.addDistributions(
      target.map((d) => d.address),
      target.map((d) => parseEther(d.amount.toString())),
      {
        gasPrice: 20 * 1000000000,
      }
    );
    await transaction.wait(1);
    console.log("success register,", count);
  }
};

main();
