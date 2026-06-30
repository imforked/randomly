export const handleBadResponse = (apiResponse: Response) => {
  if (!apiResponse.ok) {
    if (apiResponse.status === 404) {
      throw new Error("Room not found.");
    }
    if (apiResponse.status === 409) {
      throw new Error("Room is full.");
    }
    if (apiResponse.status === 410) {
      throw new Error("Room expired.");
    }

    throw new Error("Something went wrong.");
  }
};

const USER_ID_COOKIE_KEY = ({ roomId }: { roomId: string }) =>
  `randomly:user:${roomId}`;

export const setStoredUserId = ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  localStorage.setItem(USER_ID_COOKIE_KEY({ roomId }), userId);
};

export const getStoredUserId = ({ roomId }: { roomId: string }) => {
  return localStorage.getItem(USER_ID_COOKIE_KEY({ roomId }));
};

export const getWebSocketUrl = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is undefined.");
  }

  const parsed = new URL(apiBaseUrl);
  const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";

  return `${wsProtocol}//${parsed.host}`;
};
