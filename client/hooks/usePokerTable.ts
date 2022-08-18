import { useState, useEffect, useRef } from "react";
import { UserType } from "./useUserId";
import { CONNECTION_TOKENS_KEY } from "../constants";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "isomorphic-ws";

export type tableState = {
  roomId: string;
  currentUserId: string;
  users?: { [key: string]: UserType } | null;
};

const usePokerTable = (
  initialTableState: tableState
): [
  tableState,
  (roomId: string, userId: string) => void,
  (user: UserType) => void,
  () => void,
  boolean,
  boolean
] => {
  const [table, setTable] = useState(initialTableState);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // https://developer.mozilla.org/ja/docs/Web/API/WebSocket/readyState
  // 0	CONNECTING	Socket has been created. The connection is not yet open.
  // 1	OPEN	The connection is open and ready to communicate.
  // 2	CLOSING	The connection is in the process of closing.
  // 3	CLOSED	The connection is closed or couldn't be opened.
  const WebSocketReadyState = ["COCONNECTINGN", "OPEN", "CLOSING", "CLOSED"];

  const socketRef = useRef<WebSocket>(null!);

  useEffect(() => {
    if (!table.roomId || !table.currentUserId) return;
    const roomId = table.roomId;
    const userId = table.currentUserId;
    console.log(`Connecting...`);

    const connectionToken = uuidv4();
    const query = `?roomId=${roomId}&userId=${userId}&connectionToken=${connectionToken}`;
    const tokensStr = localStorage.getItem(CONNECTION_TOKENS_KEY) || "[]";
    const tokens: string[] = JSON.parse(tokensStr) || [];
    tokens.push(connectionToken);
    localStorage.setItem(CONNECTION_TOKENS_KEY, JSON.stringify(tokens));

    socketRef.current = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}${query}`
    );

    console.log(socketRef, socketRef.current);

    // 最新のテーブル情報
    socketRef.current.onopen = (payload) => {
      console.log("socket onOpen");
      // if (socketRef.current.readyState != WebSocket.OPEN) return;
      // console.log("state: ", socketRef.current);
      // 最新のテーブルデータを受信する
      const params = { action: "fetchLatestTable", roomId: roomId };
      socketRef.current.send(JSON.stringify(params));

      disconnectZombieConnections(roomId, userId);
    };

    socketRef.current.onclose = (payload) => {
      console.log("socket onClose", payload);
      setIsError(true);
      // alert("closed");
    };

    socketRef.current.onmessage = (payload: any) => {
      if (socketRef.current.readyState != WebSocket.OPEN) return;

      const message = JSON.parse(payload.data);

      console.log("socket onMessage", message);
      console.log("action: ", message.action);
      if (!message.value || !message.value.users) {
        console.log("Invalid message");
        return;
      }

      const newUsers: { [key: string]: UserType } = {};
      for (const user of message.value.users) {
        newUsers[user.userId] = user;
      }

      const newTable: tableState = {
        roomId: table.roomId,
        currentUserId: table.currentUserId,
        users: newUsers,
      };

      setIsLoading(false);
      setTable({ ...newTable });
    };

    socketRef.current.onerror = (payload) => {
      console.log("socket onError", payload);
      setIsError(true);
    };

    window.addEventListener("beforeunload", () => {
      socketRef.current.close();
    });

    // set reconnect
    const MAX_ATTEMPT = 3;
    let attempt = 0;

    const interval = setInterval(() => {
      console.log("state: ", WebSocketReadyState[socketRef.current.readyState]);
      if (socketRef.current.readyState === 0 && attempt <= MAX_ATTEMPT) {
        try {
          socketRef.current.terminate();
        } catch {}
        socketRef.current = new WebSocket(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}${query}`
        );

        attempt += 1;
      }

      if (attempt > MAX_ATTEMPT) {
        clearInterval(interval);

        if (
          confirm(
            "Failed to connect to server. Reloading the browser may fix the problem. Are you sure you want to reload?"
          )
        ) {
          window.location.reload();
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socketRef.current.close();
      window.removeEventListener("beforeunload", () => {
        socketRef.current.close();
      });
    };
  }, [table.roomId, table.currentUserId]);

  const updateTableUser = (user: UserType) => {
    if (!socketRef.current) return;
    if (socketRef.current.readyState != WebSocket.OPEN) return;
    if (!table.users) return;

    const params = { action: "updateTable", user: user, roomId: table.roomId };
    socketRef.current.send(JSON.stringify(params));

    if (user.userId) {
      table.users[user.userId] = user;
      setTable({ ...table });
    }
  };

  const resetTable = () => {
    if (!table.users) return;
    const params = { action: "resetTable", roomId: table.roomId };
    socketRef.current.send(JSON.stringify(params));

    for (const userId of Object.keys(table.users)) {
      table.users[userId].value = -1;
    }
    setTable({ ...table });
  };

  const fetchLatestTable = (roomId: string, userId: string) => {
    table.roomId = roomId;
    table.currentUserId = userId;
    setTable({ ...table });
  };

  const disconnectZombieConnections = (roomId: string, userId: string) => {
    const tokensStr = localStorage.getItem(CONNECTION_TOKENS_KEY);
    const tokens: string[] = tokensStr ? JSON.parse(tokensStr) : [];
    tokens.pop();
    console.log("disconnectZombieConnections");
    if (tokens.length > 0) {
      tokens;
      const params = {
        action: "disconnectZombieConnections",
        connectionTokens: tokens,
        roomId: roomId,
        userId: userId,
      };
      socketRef.current.send(JSON.stringify(params));
    }

    localStorage.setItem(CONNECTION_TOKENS_KEY, "");
  };

  return [
    table,
    fetchLatestTable,
    updateTableUser,
    resetTable,
    isLoading,
    isError,
  ];
};

export default usePokerTable;
