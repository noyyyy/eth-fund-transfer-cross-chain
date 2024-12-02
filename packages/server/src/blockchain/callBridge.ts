import { mantleSepoliaTestnet, sepolia } from "viem/chains";
import { CrossChainMessenger } from "@mantleio/sdk";
import { BigNumber, ethers } from "ethers";
import fs from "fs-extra";
import { BridgeAddresses, WETH_MANTA_SEPOLIA } from "./constants";
import { zeroAddress } from "viem";

const l1RpcProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia/a040a36e16527866052f32a9d44a40b5acf334b733a530b9ee4ba6cc435c6375",
);
const l2RpcProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/mantle_sepolia/a040a36e16527866052f32a9d44a40b5acf334b733a530b9ee4ba6cc435c6375",
);

const pk = process.env.PRIVATE_KEY;

const l1Wallet = new ethers.Wallet(pk, l1RpcProvider);
const l2Wallet = new ethers.Wallet(pk, l2RpcProvider);

const crossChainMessenger = new CrossChainMessenger({
  l1ChainId: sepolia.id,
  l2ChainId: mantleSepoliaTestnet.id,
  l1SignerOrProvider: l1Wallet,
  l2SignerOrProvider: l2Wallet,
  bedrock: true,
});

const L1TestERC20 = JSON.parse(
  fs.readFileSync("./src/blockchain/abi/L1TestERC20.json", "utf-8"),
);
const L2StandardERC20 = JSON.parse(
  fs.readFileSync("./src/blockchain/abi/L2StandardERC20.json", "utf-8"),
);

const factory__L1_ERC20 = new ethers.ContractFactory(
  L1TestERC20.abi,
  L1TestERC20.bytecode,
);
const factory__L2_ERC20 = new ethers.ContractFactory(
  L2StandardERC20.abi,
  L2StandardERC20.bytecode,
);

export async function sendETHToMantleL2(amount: BigNumber) {
  const tx = await crossChainMessenger.depositETH(amount);

  return tx;
}

export async function withdrawETHToMainnet(amount: BigNumber) {
  const mantleSepolia_WETH = factory__L1_ERC20.attach(WETH_MANTA_SEPOLIA);

  const t = await mantleSepolia_WETH
    .connect(l2Wallet)
    .approve(BridgeAddresses[mantleSepoliaTestnet.id], amount);

  await t.wait();

  // await crossChainMessenger.approveERC20(
  //   zeroAddress,
  //   WETH_MANTA_SEPOLIA,
  //   amount,
  // );

  const tx = await crossChainMessenger.withdrawETH(amount);

  return tx;
}

export async function getTxStatus(txHash: string) {
  const status = await crossChainMessenger.getMessageStatus(txHash);

  return status;
}

export async function submitProof(txHash: string) {
  const tx = await crossChainMessenger.proveMessage(txHash);

  return tx;
}

export async function withdrawAssets(txHash: string) {
  return await crossChainMessenger.finalizeMessage(txHash);
}
