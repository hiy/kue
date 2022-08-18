import { useState } from "react";
import { UserType } from "./useUserId";

export type ScoreType = {
  progressRate: number;
  average: number | string | null;
};

const useScore = (initialScore: {
  average: number | string | null;
  progressRate: number;
}): [ScoreType, (users: { [key: string]: UserType }) => void] => {
  const [score, setScore] = useState<ScoreType>(initialScore);

  const calculateScore = (usersObject: { [key: string]: UserType }) => {
    // ユーザの全員がカードを選択したら結果を表示する
    const users = Object.values(usersObject);
    if (users.length == 0) return;

    // 未選択のユーザ数
    const unselectedUser = users.filter((user) => {
      return user.value < 0;
    });
    if (unselectedUser.length > 0) {
      const selectedUser = users.length - unselectedUser.length;
      const rate = (selectedUser / users.length) * 100;
      const newScore = {
        average: null,
        progressRate: rate,
      };
      setScore({ ...newScore });
      return;
    }

    let notNumberSelectedUser = 0;
    let isInfinity = false;

    const sum = users
      .map((user) => user.value)
      .reduce((acc: number, value) => {
        if (typeof value == "string") {
          notNumberSelectedUser += 1;
          if (value === "∞") {
            isInfinity = true;
          }
          return acc;
        }

        return acc + value;
      }, 0);

    const average = isInfinity
      ? "∞"
      : sum / (users.length - notNumberSelectedUser);

    if (sum === 0 && users.length - notNumberSelectedUser === 0) {
      setScore({
        average: "-",
        progressRate: 100,
      });
      return;
    }

    setScore({
      average: average,
      progressRate: 100,
    });
  };

  return [score, calculateScore];
};

export default useScore;
