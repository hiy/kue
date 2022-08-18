type Props = {
  progressRate: number;
  average: number | string | null;
};

const MobileResult = (props: Props) => {
  return (
    <div className="flex justify-center sm:hidden">
      <table className="table-fixed">
        <tbody>
          <tr>
            <td></td>
            <td
              className={`border ${
                props.progressRate === 100 ? "border-green-500" : ""
              } px-4 py-2`}>
              Average:
            </td>
            <td
              className={`border ${
                props.progressRate === 100 ? "border-green-500" : ""
              } px-4 py-2`}>
              {props.average || "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MobileResult;
