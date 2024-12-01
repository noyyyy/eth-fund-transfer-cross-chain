import { PrismaClient, TransferTask } from "@prisma/client";
import { CronJob } from "cron";
import { sendETHFromSepoliaToMantleSepolia } from "../blockchain/callBridge";
import { prisma } from "../utils";
import { Hash, HashDomainErrorType, zeroAddress } from "viem";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";
import { checkFinalized } from "../blockchain/checkFinalized";

export class TaskScheduler {
  private prisma: PrismaClient;
  private transferTaskJob: CronJob;

  constructor() {
    this.prisma = new PrismaClient();
    // Run every 5 minute
    this.transferTaskJob = new CronJob("* * * * *", () => {
      this.processTransferTasks();
    });
  }

  private async processTransferTasks() {
    try {
      // Find all pending tasks
      const pendingTasks = await this.prisma.transferTask.findMany({
        where: {
          status: "Queue",
        },
        take: 1, // Process 1 tasks per batch
      });

      // Process each task
      for (const task of pendingTasks) {
        try {
          // TODO: Implement task processing logic
          await this.processTask(task);
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in task processing:", error);
    }
  }

  private async processTask(task: TransferTask) {
    // TODO: Implement specific task processing logic
    // e.g., call blockchain interface, update task status
    if (task.status === "Queue") {
      if (
        task.fromChain === sepolia.id &&
        task.toChain === mantleSepoliaTestnet.id &&
        task.fromTokenAddress === zeroAddress
      ) {
        const tx = await sendETHFromSepoliaToMantleSepolia(
          BigInt(task.fromTokenAmount.toString()),
        );

        await prisma.transferTask.update({
          where: { id: task.id },
          data: { FromTxHash: tx, status: "WaitFromSendingConfirmed" },
        });
      }
    }

    if (task.status === "WaitFromSendingConfirmed") {
      const finalized = await checkFinalized(
        task.fromChain,
        task.FromTxHash as Hash,
      );

      if (finalized) {
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "WaitFromReceive" },
        });
      }
    }
  }

  public start() {
    this.transferTaskJob.start();
  }

  public stop() {
    this.transferTaskJob.stop();
  }
}
