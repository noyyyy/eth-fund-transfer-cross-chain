import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils";
import { handleServerError } from "../helpers/errors.helper";
import { STANDARD } from "../constants/request";

export const getAccount = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const account = await prisma.account.findFirst({
      select: { address: true, NativeBalance: true },
    });

    return reply.code(STANDARD.OK.statusCode).send({
      account,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
