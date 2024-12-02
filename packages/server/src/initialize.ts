import {
  Account,
  Address,
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, mantleSepoliaTestnet } from "viem/chains";
import { prisma } from "./utils";
import { ChainMap, WETH_MANTA_SEPOLIA } from "./blockchain/constants";

const erc20Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

export async function initialize() {
  const pk = process.env.PRIVATE_KEY;

  const account = privateKeyToAccount(pk as `0x${string}`);

  // upsert account
  await prisma.account.upsert({
    where: { address: account.address },
    create: { address: account.address },
    update: {},
  });

  // upsert network
  await prisma.network.upsert({
    where: { chainId: 11155111 },
    create: { chainId: 11155111, name: "Sepolia", alias: "sepo" },
    update: {},
  });

  await prisma.network.upsert({
    where: { chainId: 5003 },
    create: {
      chainId: 5003,
      name: "Mantle Sepolia Testnet",
      alias: "mantleSepo",
    },
    update: {},
  });

  // refresh balance
  await refreshFullBalance(account.address);
}

export async function refreshFullBalance(address: Address) {
  await refreshBalance(sepolia.id, address);
  await refreshBalance(mantleSepoliaTestnet.id, address);

  await refreshErc20Balance(
    mantleSepoliaTestnet.id,
    address,
    WETH_MANTA_SEPOLIA,
  );
}

async function refreshBalance(chainId: number, address: Address) {
  const chain = ChainMap[chainId];
  const client = createPublicClient({ chain: chain, transport: http() });

  const balance = await client.getBalance({ address: address });

  await prisma.nativeBalance.upsert({
    where: {
      accountAddress_networkChainId: {
        networkChainId: chainId,
        accountAddress: address,
      },
    },
    create: {
      networkChainId: chainId,
      accountAddress: address,
      balance: balance.toString(),
    },
    update: { balance: balance.toString() },
  });
}

async function refreshErc20Balance(
  chainId: number,
  accountAddress: Address,
  tokenAddress: Address,
) {
  const chain = ChainMap[chainId];
  const client = createPublicClient({ chain: chain, transport: http() });

  // Get token balance
  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [accountAddress],
  });

  // Get token symbol
  const symbol = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
  });

  // Update or create token balance record
  await prisma.eRC20Balance.upsert({
    where: {
      contractAddress_accountAddress_networkChainId: {
        accountAddress: accountAddress,
        networkChainId: chainId,
        contractAddress: tokenAddress,
      },
    },
    create: {
      accountAddress: accountAddress,
      networkChainId: chainId,
      contractAddress: tokenAddress,
      balance: balance.toString(),
      symbol: symbol,
    },
    update: {
      balance: balance.toString(),
      symbol: symbol,
    },
  });
}
