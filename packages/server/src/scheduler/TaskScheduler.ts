import { PrismaClient, TransferTask } from "@prisma/client";
import { CronJob } from "cron";
import {
  getTxStatus,
  sendETHToMantleL2,
  submitProof,
  withdrawAssets,
  withdrawETHToMainnet,
} from "../blockchain/callBridge";
import { prisma } from "../utils";
import { Hash, HashDomainErrorType, zeroAddress } from "viem";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";
import { MessageStatus } from "@mantleio/sdk";
import { BigNumber } from "ethers";
import { WETH_MANTA_SEPOLIA } from "../blockchain/constants";

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
        where: { status: { notIn: ["Success", "Failed", "Cancelled"] } },
        take: 10, // Process 1 tasks per batch
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
        const tx = await sendETHToMantleL2(
          BigNumber.from(task.fromTokenAmount.toString()),
        );

        await prisma.transferTask.update({
          where: { id: task.id },
          data: { FromTxHash: tx.hash, status: "TriggerSent" },
        });
      }

      if (
        task.fromChain === mantleSepoliaTestnet.id &&
        task.fromTokenAddress === WETH_MANTA_SEPOLIA &&
        task.toChain === sepolia.id
      ) {
        const tx = await withdrawETHToMainnet(
          BigNumber.from(task.fromTokenAmount.toString()),
        );

        await prisma.transferTask.update({
          where: { id: task.id },
          data: { FromTxHash: tx.hash, status: "TriggerSent" },
        });
      }
    }

    // execute submit proof
    if (task.status === "ReadyToProve") {
      try {
        await submitProof(task.FromTxHash);

        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "ProveSent" },
        });
      } catch (error) {
        console.error(`Failed to submit proof for task ${task.id}:`, error);
      }
    }

    // execute withdraw
    if (task.status === "ReadyToWithdraw") {
      try {
        await withdrawAssets(task.FromTxHash);

        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "WithdrawSent" },
        });
      } catch (error) {
        console.error(`Failed to withdraw assets for task ${task.id}:`, error);
      }
    }

    // check task status via mantle sdk
    const status = await getTxStatus(task.FromTxHash as Hash);

    console.log("status: ", status);

    switch (status) {
      case MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "Pending" },
        });
        break;
      case MessageStatus.FAILED_L1_TO_L2_MESSAGE:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "Failed" },
        });
        break;
      case MessageStatus.RELAYED:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "Success" },
        });
        break;

      case MessageStatus.STATE_ROOT_NOT_PUBLISHED:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "WaitForStateRoot" },
        });
        break;

      case MessageStatus.READY_TO_PROVE:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "ReadyToProve" },
        });
        break;

      case MessageStatus.IN_CHALLENGE_PERIOD:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "WaitForChallenge" },
        });
        break;

      case MessageStatus.READY_FOR_RELAY:
        await prisma.transferTask.update({
          where: { id: task.id },
          data: { status: "ReadyToWithdraw" },
        });
        break;
    }
  }

  public start() {
    this.transferTaskJob.start();
  }

  public stop() {
    this.transferTaskJob.stop();
  }
}
