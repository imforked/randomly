import type { RandomOption, RoomSubmission } from "src/api.types";
import { handleBadResponse } from "src/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchRoomSubmissions(
  roomId: string
): Promise<RoomSubmission[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/submissions`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  handleBadResponse(response);

  return response.json();
}

export type SubmitRoomOptionsParams = {
  roomId: string;
  userId: string;
  options: string[];
};

export async function fetchRandomOption(roomId: string): Promise<RandomOption> {
  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/random`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (body?.error) {
      throw new Error(body.error);
    }

    handleBadResponse(response);
  }

  return response.json();
}

export async function submitRoomOptions({
  roomId,
  userId,
  options,
}: SubmitRoomOptionsParams): Promise<RandomOption | null> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, options }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (body?.error) {
      throw new Error(body.error);
    }

    handleBadResponse(response);
  }

  const body = (await response.json()) as {
    selection?: RandomOption | null;
  };

  return body.selection ?? null;
}
