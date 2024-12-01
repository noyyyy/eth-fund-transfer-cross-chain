import { Address, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, mantleSepoliaTestnet } from "viem/chains";
import { prisma } from "./utils";

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
  await refreshBalance(sepolia.id, account.address);
  await refreshBalance(mantleSepoliaTestnet.id, account.address);
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
