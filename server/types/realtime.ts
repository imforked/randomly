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
}

export type RoomJoinPayload = {
  roomId: string;
  participantId: string;
};

export type RoomLeavePayload = {
  roomId: string;
  participantId: string;
};

export type RoomJoinedPayload = {
  roomId: string;
  participantId: string;
};

export type RoomLeftPayload = {
  roomId: string;
  participantId: string;
};

export type RoomOccupancyPayload = {
  roomId: string;
  capacity: number;
  activeCount: number;
  spotsRemaining: number;
};

export type RoomFullPayload = {
  roomId: string;
  capacity: number;
  activeCount: number;
};

export enum REALTIME_ERROR_CODES {
  ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
  ROOM_EXPIRED = "ROOM_EXPIRED",
  ALREADY_CONNECTED = "ALREADY_CONNECTED",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
}

export type RealtimeErrorCode =
  (typeof REALTIME_ERROR_CODES)[keyof typeof REALTIME_ERROR_CODES];
export type RoomErrorPayload = {
  code: RealtimeErrorCode;
  message: string;
};
