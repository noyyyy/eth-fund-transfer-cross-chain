import { Address, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { BridgeAbi, BridgeAddresses } from "./constants";

export async function sendETHFromSepoliaToMantleSepolia(amount: bigint) {
  const pk = process.env.PRIVATE_KEY;

  const account = privateKeyToAccount(pk as Address);

  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account: account,
  });

  const { request } = await client.simulateContract({
    account: account,
    address: BridgeAddresses[sepolia.id],
    abi: BridgeAbi,
    functionName: "depositETH",
    args: [200000, "0x"],
    value: amount,
  });

  try {
    const tx = await walletClient.writeContract(request);

    return tx;
  } catch {}
}
