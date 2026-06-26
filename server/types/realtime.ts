import { RoomConfig, User } from "../generated/prisma/client.ts";

export type RoomId = Pick<RoomConfig, "id">;

export enum CLIENT_EVENTS {
  JOIN = "room:join",
  LEAVE = "room:leave",
}

export enum SERVER_EVENTS {
  JOINED = "room:joined",
  LEFT = "room:left",
  OCCUPANCY = "room:occupancy",
  FULL = "room:full",
  ERROR = "room:error",
  USERS = "room:users",
  SUBMISSIONS = "room:submissions",
}

export type RoomJoinPayload = {
  roomId: RoomId;
  userId: string;
};

export type RoomLeavePayload = {
  roomId: RoomId;
  userId: string;
};

export type RoomJoinedPayload = {
  roomId: RoomId;
  user: Pick<User, "id" | "name">;
};

export type RoomLeftPayload = {
  roomId: RoomId;
  userId: string;
};

export type RoomOccupancyPayload = {
  roomId: RoomId;
  capacity: number;
  activeCount: number;
  spotsRemaining: number;
};

export type RoomFullPayload = {
  roomId: RoomId;
  capacity: number;
  activeCount: number;
};

export type RoomUsersPayload = {
  roomId: RoomId;
  users: Pick<User, "id" | "name">[];
};

export type RoomSubmissionsPayload = {
  roomId: RoomId;
  submissions: {
    id: string;
    name: string;
    hasSubmitted: boolean;
  }[];
};

export type Payload =
  | RoomJoinPayload
  | RoomLeavePayload
  | RoomJoinedPayload
  | RoomLeftPayload
  | RoomOccupancyPayload
  | RoomFullPayload
  | RoomErrorPayload
  | RoomUsersPayload
  | RoomSubmissionsPayload;

export type ClientPayload = {
  roomId: string;
  userId: string;
};

export enum REALTIME_ERROR_CODES {
  ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
  ROOM_EXPIRED = "ROOM_EXPIRED",
  ALREADY_CONNECTED = "ALREADY_CONNECTED",
  FULL = "FULL",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
}

export type RealtimeErrorCode =
  (typeof REALTIME_ERROR_CODES)[keyof typeof REALTIME_ERROR_CODES];
export type RoomErrorPayload = {
  code: RealtimeErrorCode;
  message: string;
};
