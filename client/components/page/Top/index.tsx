import type { NextPage } from "next";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { USER_ID_KEY } from "../../../constants";
import GlobalHeader from "../../../components/ui/GlobalHeader";

const TopPage: NextPage = () => {
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = uuidv4();

    const userId = localStorage.getItem(USER_ID_KEY) || uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);

    router.push({
      pathname: "/room/[id]",
      query: { id: roomId },
    });
  };

  return (
    <>
      <GlobalHeader />

      <div className="max-w-screen-lg bg-white mx-auto text-center py-12 mt-4">
        <h2 className="text-3xl leading-9 font-bold tracking-tight text-gray-800 sm:text-4xl sm:leading-10">
          Kue is a simple and mobile-friendly planning poker.
        </h2>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleCreateRoom}
            className="bg-blue-500 hover:bg-blue-300 text-white rounded px-4 py-2">
            Create Room (Free)
          </button>
        </div>
      </div>
    </>
  );
};

export default TopPage;
