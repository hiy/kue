import React, { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import usePokerTable from "../../../hooks/usePokerTable";
import useUserId, { UserType } from "../../../hooks/useUserId";
import useScore from "../../../hooks/useScore";

import Loading from "../../../components/ui/Loading";
import ReloadPrompt from "../../../components/ui/ReloadPrompt";
import GlobalHeader from "../../../components/ui/GlobalHeader";
import ShareLink from "../../ui/ShareLink";
import MobileProgress from "../../ui/MobileProgress";
import CardSelection from "../../ui/CardSelection";
import MobileResult from "../../ui/MobileResult";
import SelectedCards from "../../ui/SelectedCards";
import Result from "../../ui/Result";

const RoomPage: NextPage = () => {
  const router = useRouter();
  const query = router.query;
  const roomId: string = query.id as string;

  const { currentUserId, isLoadingUser } = useUserId();
  const [
    table,
    fetchLatestTable,
    updateTableUser,
    resetTable,
    isLoadingTable,
    isErrorTable,
  ] = usePokerTable({
    roomId: roomId,
    currentUserId: currentUserId,
    users: null,
  });
  const [score, calculateScore] = useScore({ average: null, progressRate: 0 });
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [config, setConfig] = useState({
    cardPackType: 0,
    isAnonymousMode: false,
  });

  useEffect(() => {
    if (!roomId || !currentUserId) return;
    fetchLatestTable(roomId, currentUserId);
  }, [roomId, currentUserId]);

  useEffect(() => {
    if (!table.users) return;
    calculateScore(table.users);

    for (const user of Object.values(table.users)) {
      if (user.userId === currentUserId) {
        return setCurrentUser(user);
      }
    }
  }, [table]);

  const handleSelectCard = (selectNumber: number | string) => {
    if (!table.users) table.users = {};
    if (!currentUser) return;

    currentUser.value = selectNumber;
    updateTableUser(currentUser);
  };

  // TODO: refactoring
  const handleChangeConfig = (changeValue: {
    type: string;
    value?: number;
  }) => {
    if (changeValue.type === "changePack") {
      if (changeValue.value) {
        config.cardPackType = changeValue.value;
      }
    } else if (changeValue.type === "changeAnonymousMode") {
      config.isAnonymousMode = !config.isAnonymousMode;
    }
    setConfig({ ...config });
  };

  const handleReset = () => resetTable();
  const handleTop = () => router.push("/");

  if (isErrorTable)
    return (
      <>
        <GlobalHeader onClickBrand={handleTop} />
        <div className="mt-20 mx-10">
          <ReloadPrompt />
        </div>
      </>
    );

  if (isLoadingTable || isLoadingUser || !roomId || !currentUser)
    return (
      <>
        <GlobalHeader onClickBrand={handleTop} />
        <div className="mt-20 mx-10">
          <Loading />
        </div>
      </>
    );

  return (
    <>
      <GlobalHeader
        onClickBrand={handleTop}
        onChangeConfig={handleChangeConfig}
        config={config}
      />

      <div className="container mx-auto">
        <main>
          <div className="mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-1 sm:px-0">
              <CardSelection
                type={"default"}
                selected={currentUser.value}
                onSelected={(e, number) => handleSelectCard(number)}
              />

              <div className="mt-5">
                <MobileResult
                  progressRate={score.progressRate}
                  average={score.average}
                />
              </div>

              <div className="grid grid-cols-5 gap-4 mt-5">
                <div className="hidden sm:block col-span-2 xs:col-span-2 md:col-span-2 lg:col-span-1 border-4 border-dashed border-gray-200 rounded-lg h-30 px-2 py-2 mb-4">
                  <ShareLink />
                </div>

                <div className="hidden sm:block col-span-5 xs:col-span-5 sm:col-span-3 md:col-span-3 lg:col-span-4 border-4 border-dashed border-gray-200 rounded-lg h-30 px-2 py-2 mb-4">
                  <div className="content-between grid grid-cols-1 h-full">
                    <SelectedCards
                      users={table.users ? Object.values(table.users) : []}
                      currentUserId={currentUser.userId}
                      isGameEnded={score.average ? true : false}
                      config={config}
                    />
                    <div className="mt-4">
                      <Result
                        progressRate={score.progressRate}
                        average={score.average}
                        onResetPoker={handleReset}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileProgress
        progressRate={score.progressRate}
        userEmoji={currentUser.emoji}
        config={config}
      />
    </>
  );
};

export default RoomPage;
