import { randomUUID } from "crypto";

import pino from "pino";
import { pinoHttp } from "pino-http";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProd ? "info" : "debug",
  // base structured JSON logs in all environments
  ...(isProd
    ? {}
    : {
        // pretty-print only in development
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});

export const httpLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const header = req.headers["x-request-id"];
    const fromHeader = Array.isArray(header) ? header[0] : header;
    const raw = fromHeader || randomUUID();
    const id = typeof raw === "string" ? raw.slice(0, 64) : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
