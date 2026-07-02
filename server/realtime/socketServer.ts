import { Server } from "node:http";
import { WebSocketServer, VerifyClientCallbackSync } from "ws";
import { REALTIME_ERROR_CODES, CLIENT_EVENTS } from "../types/realtime.ts";
import { sendError } from "./send.ts";
import { getRoomId, getUserId } from "./parsePayload.ts";
import { handleJoin, handleDisconnect, handleLeave } from "./handlers/index.ts";
import { INVALID_MESSAGE_FORMAT } from "../constants/errorMessages.ts";
import { isAllowedOrigin } from "../constants/allowedOrigins.ts";

const connections = new Map();

export const attachSocketServer = (server: Server) => {
  const verifyOrigin: VerifyClientCallbackSync = (info) =>
    isAllowedOrigin(info.origin);

  const webSocketServer = new WebSocketServer({
    server,
    verifyClient: verifyOrigin,
  });

  webSocketServer.addListener("connection", (socket, request) => {
    const socketId = crypto.randomUUID();
    connections.set(socketId, socket);

    socket.on("message", (raw) => {
      const stringifiedMessage = raw.toString();

      let parsedMessage;

      try {
        parsedMessage = JSON.parse(stringifiedMessage);
      } catch {
        sendError({
          socket,
          errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
          errorMessage: INVALID_MESSAGE_FORMAT,
        });

        return;
      }

      if (typeof parsedMessage?.event !== "string") {
        sendError({
          socket,
          errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
          errorMessage: INVALID_MESSAGE_FORMAT,
        });

        return;
      }

      if (
        parsedMessage?.payload === null ||
        parsedMessage?.payload === undefined
      ) {
        sendError({
          socket,
          errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
          errorMessage: INVALID_MESSAGE_FORMAT,
        });

        return;
      }

      const { event, payload } = parsedMessage;

      if (event === CLIENT_EVENTS.JOIN) {
        handleJoin({ socket, socketId, payload });

        return;
      }

      if (event === CLIENT_EVENTS.LEAVE) {
        const roomId = getRoomId({ socket, payload });
        const userId = getUserId({ socket, payload });

        if (roomId === null) {
          return;
        }

        if (userId === null) {
          return;
        }

        handleLeave({
          socket,
          socketId,
          roomId,
          userId,
        });

        return;
      }

      sendError({
        socket,
        errorType: REALTIME_ERROR_CODES.INVALID_PAYLOAD,
        errorMessage: INVALID_MESSAGE_FORMAT,
      });

      return;
    });

    socket.on("close", async () => {
      handleDisconnect({ socket, socketId, connections });
    });
  });
};
