import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { USER_ID_KEY } from "../constants";

export type UserType = {
  connectionId: string;
  userId: string;
  emoji: string;
  value: number | string;
  isOwner: boolean;
};

const readUserId = (): string => {
  const userId: string = localStorage.getItem(USER_ID_KEY) || uuidv4();
  localStorage.setItem(USER_ID_KEY, userId);
  return userId;
};

const useUserId = (): { currentUserId: string; isLoadingUser: boolean } => {
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUserId(readUserId());
    setIsLoading(false);
  }, []);

  return {
    currentUserId: userId,
    isLoadingUser: isLoading,
  };
};

export default useUserId;
