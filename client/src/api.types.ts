export type RoomConfig = {
  topic: string;
  size: number;
  optionsPerGuest: number;
  id: string;
  expiresAt: Date;
};

export type User = {
  name: string;
  id: string;
  roomId: string;
  createdAt: Date;
};
