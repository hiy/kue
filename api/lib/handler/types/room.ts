import UserType from "./user";

type RoomType = {
  roomId: string;
  users: { [key: string]: UserType };
  createdAt: number;
};

export default RoomType;
