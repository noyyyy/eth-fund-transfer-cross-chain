import fastify from "fastify";
import pino from "pino";
import taskRouter from "./routes/transferTask.router";
import loadConfig from "./config/env.config";
import { utils } from "./utils";
import formbody from "@fastify/formbody";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import accountRouter from "./routes/account.router";
import { initialize } from "./initialize";
import { TaskScheduler } from "./scheduler/TaskScheduler";
import { createEventListener } from "./blockchain/listenBridgeConfimredEvent";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";

loadConfig();

const port = Number(process.env.API_PORT) || 5001;
const host = "0.0.0.0";

const startServer = async () => {
  initialize();

  const server = fastify({
    logger: pino({ level: process.env.LOG_LEVEL }),
  });

  // Register middlewares
  server.register(formbody);
  server.register(cors);
  server.register(helmet);

  // Register routes
  server.register(taskRouter, { prefix: "/api/transfer" });
  server.register(accountRouter, { prefix: "/api/account" });

  // Set error handler
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    reply.status(500).send({ error: "Something went wrong" });
  });

  // Health check route
  server.get("/health", async (_request, reply) => {
    try {
      await utils.healthCheck();
      reply.status(200).send({
        message: "Health check endpoint success.",
      });
    } catch (e) {
      reply.status(500).send({
        message: "Health check endpoint failed.",
      });
    }
  });

  // Root route
  server.get("/", (request, reply) => {
    reply.status(200).send({ message: "Hello from fastify boilerplate!" });
  });

  // listen event
  createEventListener(sepolia.id);
  createEventListener(mantleSepoliaTestnet.id);

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        scheduler.stop();
        server.log.info("Task scheduler stopped");
        await server.close();
        server.log.error(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        server.log.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  // Start scheduler
  const scheduler = new TaskScheduler();
  scheduler.start();
  server.log.info("Task scheduler started");

  // Start server
  try {
    await server.listen({
      port,
      host,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
