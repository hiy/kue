import ProgressRing from "../ProgressRing";

type Props = {
  progressRate: number;
  userEmoji: string;
  config: {
    cardPackType: number;
    isAnonymousMode: boolean;
  };
};

const MobileProgress = (props: Props) => {
  return (
    <div className="block sm:hidden relative bg-white">
      <div className="fixed h-22 bottom-0 left-0 right-0 bg-white">
        <div className="flex flex-row justify-around border-t-2">
          <div>
            <ProgressRing percent={props.progressRate} />
          </div>
          {props.config.isAnonymousMode ? null : (
            <table className="table-fixed mr-6">
              <tbody>
                <tr>
                  <td className=" px-4 py-2">You: </td>
                  <td className="text-5xl px-4 py-2">{props.userEmoji}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileProgress;
