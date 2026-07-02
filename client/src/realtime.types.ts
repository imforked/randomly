import type { RandomOption, RoomSubmission, RoomUser } from "src/api.types";

export const CLIENT_EVENTS = {
  JOIN: "room:join",
  LEAVE: "room:leave",
} as const;

export const SERVER_EVENTS = {
  JOINED: "room:joined",
  LEFT: "room:left",
  OCCUPANCY: "room:occupancy",
  FULL: "room:full",
  ERROR: "room:error",
  USERS: "room:users",
  SUBMISSIONS: "room:submissions",
  SELECTION: "room:selection",
} as const;

export type RoomUsersPayload = {
  roomId: { id: string };
  users: RoomUser[];
};

export type RoomSubmissionsPayload = {
  roomId: { id: string };
  submissions: RoomSubmission[];
};

export type RoomSelectionPayload = {
  roomId: { id: string };
  option: RandomOption;
};

export type RoomErrorPayload = {
  code: string;
  message: string;
};

export type ServerMessage =
  | { event: typeof SERVER_EVENTS.USERS; payload: RoomUsersPayload }
  | { event: typeof SERVER_EVENTS.SUBMISSIONS; payload: RoomSubmissionsPayload }
  | { event: typeof SERVER_EVENTS.SELECTION; payload: RoomSelectionPayload }
  | { event: typeof SERVER_EVENTS.ERROR; payload: RoomErrorPayload }
  | { event: string; payload: unknown };
