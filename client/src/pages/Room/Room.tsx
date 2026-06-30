import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type RoomConfig, type User } from "src/api.types";
import { getStoredUserId, handleBadResponse, setStoredUserId } from "src/utils";
import { NameEntryForm } from "src/components/NameEntryForm/NameEntryForm";
import type { PageStatus } from "./Room.types";

export const Room = () => {
  const [room, setRoom] = useState<RoomConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { roomId } = useParams();

  useEffect(() => {
    if (!roomId) {
      setError("roomId is undefined.");
      setPageStatus("error");
      return;
    }

    const fetchRoomConfig = async (): Promise<RoomConfig> => {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      handleBadResponse(response);

      return response.json();
    };

    const fetchUsersInRoom = async (): Promise<User[]> => {
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/${roomId}/users`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      handleBadResponse(response);

      return response.json();
    };

    const fetchRoomData = async () => {
      try {
        const roomData = await fetchRoomConfig();
        const users = await fetchUsersInRoom();
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
  }, [roomId, API_BASE_URL]);

  const handleNameSubmit = async (name: string) => {
    setIsSubmittingName(true);
    setFormErrorMessage(null);

    if (!roomId) {
      setIsSubmittingName(false);
      throw new Error("roomId is undefined.");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/${roomId}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );

      handleBadResponse(response);

      const user = await response.json();

      if (!user.id) {
        setFormErrorMessage("Something went wrong.");
        return;
      }

      setStoredUserId({ roomId, userId: user.id });
      setPageStatus("inRoom");
    } catch (error) {
      if (error instanceof Error) {
        setFormErrorMessage(error.message);
      } else {
        setFormErrorMessage("Something went wrong.");
      }
      console.error(error);
    } finally {
      setIsSubmittingName(false);
    }
  };

  if (pageStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  if (pageStatus === "error") {
    return <h1>{error}</h1>;
  }

  if (pageStatus === "nameEntry") {
    return (
      <NameEntryForm
        onSubmit={handleNameSubmit}
        isSubmitting={isSubmittingName}
        errorMessage={formErrorMessage}
        onErrorDismiss={() => setFormErrorMessage(null)}
      />
    );
  }

  return <h1>{room?.topic}</h1>;
};
