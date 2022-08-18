import { RefreshIcon } from "@heroicons/react/solid";

type Props = {
  progressRate: number;
  average: number | string | null;
  onResetPoker: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
};

const Result = (props: Props) => {
  return (
    <div className="flex justify-center">
      <table className="table-fixed mr-5">
        <tbody>
          <tr>
            <td
              className={`border ${
                props.progressRate === 100 ? "border-green-500" : ""
              } px-4 py-2`}>
              Average
            </td>
            <td
              className={`border ${
                props.progressRate === 100 ? "border-green-500" : ""
              } px-4 py-2`}>
              {" "}
              {props.average ? <div>{props.average}</div> : <div>-</div>}
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={props.onResetPoker}
        className="bg-gray-400 hover:bg-gray-300 text-white rounded px-4 py-2">
        <RefreshIcon className="h-8 w-8 text-gray-100" />
      </button>
    </div>
  );
};

export default Result;
