import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type RoomConfig, type User } from "src/api.types";
import {
  fetchRoomSubmissions,
  submitRoomOptions,
} from "src/api/roomExperienceApi";
import { LoadingScreen } from "src/components/LoadingScreen/LoadingScreen";
import { RoomExperience } from "src/components/RoomExperience/RoomExperience";
import { NameEntryForm } from "src/components/NameEntryForm/NameEntryForm";
import { useMinimumDuration } from "src/hooks/useMinimumDuration";
import { useRoomSocket } from "src/hooks/useRoomSocket";
import {
  clearStoredUserId,
  getStoredUserId,
  handleBadResponse,
  setStoredUserId,
} from "src/utils";
import type { PageStatus } from "./Room.types";

const LOADING_MIN_MS = 1000;

export const Room = () => {
  const [room, setRoom] = useState<RoomConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [initialLoadingVisible, setInitialLoadingVisible] = useState(true);
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmittingOptions, setIsSubmittingOptions] = useState(false);
  const [optionsErrorMessage, setOptionsErrorMessage] = useState<string | null>(
    null
  );

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { roomId } = useParams();
  const waitForMinimumLoading = useMinimumDuration(LOADING_MIN_MS);

  const finishInitialLoading = useCallback(() => {
    setInitialLoadingVisible(false);
  }, []);

  const handleInitialLoadingExit = useCallback(() => {
    setShowInitialLoading(false);
  }, []);

  const handleInvalidUser = useCallback(() => {
    if (!roomId) {
      return;
    }

    clearStoredUserId({ roomId });
    setUserId(null);
    setPageStatus("nameEntry");
  }, [roomId]);

  const { users, submissions, setSubmissions } = useRoomSocket({
    roomId,
    userId,
    enabled: pageStatus === "inRoom",
    onInvalidUser: handleInvalidUser,
  });

  useEffect(() => {
    if (!roomId) {
      void (async () => {
        await waitForMinimumLoading();
        setError("roomId is undefined.");
        setPageStatus("error");
        finishInitialLoading();
      })();
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
        const usersInRoom = await fetchUsersInRoom();
        const storedUserId = getStoredUserId({ roomId });

        const canHaveAccess =
          usersInRoom.length < roomData.size || storedUserId;

        if (!canHaveAccess) {
          await waitForMinimumLoading();
          setError("Room is full.");
          setPageStatus("error");
          finishInitialLoading();
          return;
        }

        await waitForMinimumLoading();
        setRoom(roomData);
        setPageStatus(storedUserId ? "inRoom" : "nameEntry");
        setUserId(storedUserId);
        finishInitialLoading();
      } catch (error) {
        await waitForMinimumLoading();
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong.");
        }
        setPageStatus("error");
        finishInitialLoading();
        console.error(error);
      }
    };

    fetchRoomData();
  }, [roomId, API_BASE_URL, waitForMinimumLoading, finishInitialLoading]);

  useEffect(() => {
    if (pageStatus !== "inRoom" || !roomId) {
      return;
    }

    const loadSubmissions = async () => {
      try {
        const initialSubmissions = await fetchRoomSubmissions(roomId);
        setSubmissions(initialSubmissions);
      } catch (error) {
        console.error(error);
      }
    };

    void loadSubmissions();
  }, [pageStatus, roomId, setSubmissions]);

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
      setUserId(user.id);
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

  const handleSubmitOptions = async (options: string[]) => {
    if (!roomId || !userId) {
      return;
    }

    setIsSubmittingOptions(true);
    setOptionsErrorMessage(null);

    try {
      await submitRoomOptions({ roomId, userId, options });
    } catch (error) {
      if (error instanceof Error) {
        setOptionsErrorMessage(error.message);
      } else {
        setOptionsErrorMessage("Something went wrong.");
      }
      console.error(error);
      throw error;
    } finally {
      setIsSubmittingOptions(false);
    }
  };

  if (showInitialLoading) {
    return (
      <LoadingScreen
        visible={initialLoadingVisible}
        onExitComplete={handleInitialLoadingExit}
      />
    );
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

  if (!room || !userId) {
    return <LoadingScreen />;
  }

  return (
    <RoomExperience
      room={room}
      userId={userId}
      users={users}
      submissions={submissions}
      onSubmitOptions={handleSubmitOptions}
      isSubmittingOptions={isSubmittingOptions}
      optionsErrorMessage={optionsErrorMessage}
      onOptionsErrorDismiss={() => setOptionsErrorMessage(null)}
    />
  );
};
