export type RoomConfig = {
  topic: string;
  size: number;
  optionsPerGuest: number;
  id: string;
  expiresAt: Date;
  selectedOptionId: string | null;
};

export type User = {
  name: string;
  id: string;
  roomId: string;
  createdAt: Date;
};

export type RoomUser = Pick<User, "id" | "name">;

export type RoomSubmission = {
  id: string;
  name: string;
  hasSubmitted: boolean;
};

export type RandomOption = {
  id: string;
  value: string;
  roomId: string;
  userId: string;
  user: RoomUser;
};
