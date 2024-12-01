import { FastifyInstance } from "fastify";
import * as controllers from "../controllers";
import { utils } from "../utils";
import { createTransferTaskSchema } from "../schemas/Transfer";

async function transferRouter(fastify: FastifyInstance) {
  fastify.get(
    "/task",
    {
      config: {
        description: "Get transfer tasks endpoint",
      },
    },
    controllers.getTransferTasks,
  );
  fastify.post(
    "/task",
    {
      schema: {
        body: {
          type: "object",
          required: ["fromChainId", "toChainId", "fromTokenAddress", "amount"],
          properties: {
            fromChainId: { type: "number" },
            toChainId: { type: "number" },
            fromTokenAddress: { type: "string" },
            amount: { type: "string" },
          },
        },
      },
      config: {
        description: "Create transfer task endpoint",
      },
      preValidation: utils.preValidation(createTransferTaskSchema),
    },
    controllers.createTransferTask,
  );
}

export default transferRouter;
