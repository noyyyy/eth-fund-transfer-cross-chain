import {
  Address,
  createPublicClient,
  http,
  parseAbiItem,
  type Chain,
  type PublicClient,
} from "viem";
import { prisma } from "../utils";
import { BridgeAddresses, ChainMap, FinalizedBlockNumber } from "./constants";

// ABI for DepositFinalized event
const depositFinalizedAbi = parseAbiItem(
  "event DepositFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
);

// Record the last processed block for each chain
// TODO: storage in db
const lastProcessedBlocks: Record<number, bigint> = {};
export async function listenToDepositFinalized(chainId: number) {
  const bridgeAddress = BridgeAddresses[chainId];

  const client = createPublicClient({
    chain: ChainMap[chainId],
    transport: http(),
  });

  try {
    // Get the latest finalized block
    const finalizedBlock =
      (await client.getBlockNumber()) - FinalizedBlockNumber[chainId];

    // Get or initialize the last processed block
    const lastProcessedBlock =
      lastProcessedBlocks[chainId] || finalizedBlock - 10000n; // TODO: should be the start of the bridge contract

    // Return if no new blocks
    if (lastProcessedBlock >= finalizedBlock) {
      return;
    }

    // Get event logs
    const logs = await client.getLogs({
      address: bridgeAddress,
      event: depositFinalizedAbi,
      fromBlock: lastProcessedBlock + 1n,
      toBlock: finalizedBlock,
    });

    // Process each event
    for (const log of logs) {
      const { _l1Token, _l2Token, _from, _to, _amount, _data } = log.args;

      // Save to database
      await prisma.depositEvent.create({
        data: {
          chainId,
          l1Token: _l1Token.toLowerCase(),
          l2Token: _l2Token.toLowerCase(),
          from: _from.toLowerCase(),
          to: _to.toLowerCase(),
          amount: _amount.toString(),
          data: _data,
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash,
        },
      });
    }

    // Update the last processed block
    lastProcessedBlocks[chainId] = finalizedBlock;

    console.log(
      `[Chain ${chainId}] Processed blocks from ${lastProcessedBlock} to ${finalizedBlock}`,
    );
  } catch (error) {
    console.error(`[Chain ${chainId}] Error processing deposit events:`, error);
  }
}

export function createEventListener(chainId: number, intervalMs = 15000) {
  // Execute once at initialization
  listenToDepositFinalized(chainId);

  // Set up interval task
  const intervalId = setInterval(
    () => listenToDepositFinalized(chainId),
    intervalMs,
  );

  return intervalId;
}
