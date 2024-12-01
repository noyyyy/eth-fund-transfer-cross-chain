import { createPublicClient, Hash, http } from "viem";
import { ChainMap, FinalizedBlockNumber } from "./constants";

export async function checkFinalized(chainId: number, txHash: Hash) {
  const client = createPublicClient({
    chain: ChainMap[chainId],
    transport: http(),
  });

  const res = await client.getTransactionConfirmations({ hash: txHash });

  if (res > FinalizedBlockNumber[chainId]) {
    return true;
  } else {
    false;
  }
}
