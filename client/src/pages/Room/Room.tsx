import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type RoomConfig, type User } from "src/api.types";
import { getStoredUserId, handleBadResponse } from "src/utils";
import { NameEntryForm } from "src/components/NameEntryForm/NameEntryForm";
import type { PageStatus } from "./Room.types";

export const Room = () => {
  const [room, setRoom] = useState<RoomConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");

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
      setPageStatus("error");
      return;
    }

    const fetchRoomData = async () => {
      try {
        const roomData = await fetchRoomConfig(roomId);
        const users = await fetchUsersInRoom(roomId);
        const storedUserId = getStoredUserId({ roomId });

        const canHaveAccess = users.length < roomData.size || storedUserId;

        if (!canHaveAccess) {
          setError("Room is full.");
          setPageStatus("error");
          return;
        }

        setRoom(roomData);
        setPageStatus(storedUserId ? "inRoom" : "nameEntry");
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong.");
        }
        setPageStatus("error");
        console.error(error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const handleNameSubmit = (name: string) => {
    // step 4: create the user, persist the returned id, then enter the room.
    console.log("name submitted:", name);
  };

  if (pageStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  if (pageStatus === "error") {
    return <h1>{error}</h1>;
  }

  if (pageStatus === "nameEntry") {
    return <NameEntryForm onSubmit={handleNameSubmit} />;
  }

  return <h1>{room?.topic}</h1>;
};
