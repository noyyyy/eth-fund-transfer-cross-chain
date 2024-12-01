import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils";
import { handleServerError } from "../helpers/errors.helper";
import { STANDARD } from "../constants/request";
import { ICreateTransferTaskDto } from "../schemas/Transfer";

export const getTransferTasks = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const tasks = await prisma.transferTask.findMany({});

    return reply.code(STANDARD.OK.statusCode).send({
      tasks,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const createTransferTask = async (
  request: FastifyRequest<{
    Body: ICreateTransferTaskDto;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { fromChainId, toChainId, fromTokenAddress, amount } = request.body;
    const task = await prisma.transferTask.create({
      data: {
        fromChain: fromChainId,
        toChain: toChainId,
        fromTokenAddress: fromTokenAddress,
        toTokenAddress: fromTokenAddress,
        status: "Queue",
        fromTokenAmount: amount,
      },
    });

    return reply.code(STANDARD.OK.statusCode).send({
      task,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
