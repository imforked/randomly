import {
  SERVER_EVENTS,
  Payload,
  REALTIME_ERROR_CODES,
} from "../types/realtime.ts";
import { WebSocket } from "ws";

export const send = ({
  socket,
  event,
  payload,
}: {
  socket: WebSocket;
  event: SERVER_EVENTS;
  payload: Payload;
}) => {
  socket.send(JSON.stringify({ event, payload }));
  return;
};

export const sendError = ({
  socket,
  errorType,
  errorMessage,
}: {
  socket: WebSocket;
  errorType: REALTIME_ERROR_CODES;
  errorMessage: string;
}) => {
  send({
    socket,
    event: SERVER_EVENTS.ERROR,
    payload: {
      code: errorType,
      message: errorMessage,
    },
  });

  console.error(errorMessage);
};
