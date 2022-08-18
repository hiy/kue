import { UserType } from "../../../hooks/useUserId";
import LoadingIcon from "../LoadingIcon";
import { CheckIcon } from "@heroicons/react/solid";

type Props = {
  users: UserType[];
  currentUserId: string;
  isGameEnded: boolean;
  config: {
    cardPackType: number;
    isAnonymousMode: boolean;
  };
};

const SelectedCards = (props: Props) => {
  // 現在のユーザを一番左に表示するために並べ替える
  const sortedUsers = props.users.reduce((acc: UserType[], user: UserType) => {
    if (user.userId == props.currentUserId) {
      acc.unshift(user);
    } else {
      acc.push(user);
    }
    return acc;
  }, []);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8">
      {props.users &&
        sortedUsers.map((card, i: number) => {
          const borderStyle =
            card.userId === props.currentUserId
              ? "border-4 border-orange-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700"
              : "border-4 border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700";
          if (card.value != -1) {
            return (
              <div
                key={`card-${i}`}
                className={`mr-1 mb-1 max-w-sm bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 ${borderStyle}`}>
                <div className="flex flex-col items-center px-10 py-4">
                  {card.userId === props.currentUserId || props.isGameEnded ? (
                    <span className="text-5xl mt-5">{card.value}</span>
                  ) : (
                    <CheckIcon className="mt-4 h-12 w-12 text-green-500" />
                  )}

                  <br />
                  {props.config.isAnonymousMode ? null : (
                    <span className="text-5xl">{card.emoji}</span>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={`card-${i}`}
                className={`mr-1 mb-1 max-w-sm bg-white ${borderStyle}`}>
                <div className="flex flex-col items-center py-2">
                  <LoadingIcon className="my-6" />

                  {props.config.isAnonymousMode ? null : (
                    <span className="text-5xl pb-2">{card.emoji}</span>
                  )}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};

export default SelectedCards;
