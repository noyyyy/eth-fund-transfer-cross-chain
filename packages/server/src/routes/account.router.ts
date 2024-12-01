import { FastifyInstance } from "fastify";
import * as controllers from "../controllers";

async function accountRouter(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      config: {
        description: "Get account information endpoint",
      },
    },
    controllers.getAccount,
  );
}

export default accountRouter;
