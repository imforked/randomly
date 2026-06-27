import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type RoomConfig, type User } from "src/api.types";
import { handleBadResponse } from "src/utils";

export const Room = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<RoomConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { roomId } = useParams();

  const fetchRoomConfig = async (roomId: string): Promise<RoomConfig> => {
    if (!roomId) {
      throw new Error("roomId is undefined.");
    }

    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    handleBadResponse(response);

    return response.json();
  };

  const fetchUsersInRoom = async (roomId: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    handleBadResponse(response);

    return response.json();
  };

  useEffect(() => {
    if (!roomId) {
      setError("roomId is undefined.");
      setIsLoading(false);
      return;
    }

    const fetchRoomData = async () => {
      try {
        const roomData = await fetchRoomConfig(roomId);
        const users = await fetchUsersInRoom(roomId);

        if (users.length >= roomData.size) {
          setError("Room is full.");
          setIsLoading(false);
          return;
        }

        setRoom(roomData);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong.");
        }
        setIsLoading(false);
        console.error(error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  return (
    <>
      {isLoading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : error ? (
        <h1>{error}</h1>
      ) : (
        <div>
          <h1>{room?.topic}</h1>
        </div>
      )}
    </>
  );
};
