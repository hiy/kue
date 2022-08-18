import { CheckIcon } from "@heroicons/react/solid";

type Props = {
  percent: number;
  value?: number | string | null;
};

const ProgressRing = (props: Props) => {
  const percent = props.percent;
  const value = props.value;
  const circumference = 30 * 2 * Math.PI;

  return (
    <div className="inline-flex items-center justify-center overflow-hidden rounded-full bottom-5 left-5">
      <svg className="w-20 h-20">
        <circle
          className={percent === 100 ? "text-green-600" : "text-gray-300"}
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="30"
          cx="40"
          cy="40"
        />
        <circle
          className={percent === 100 ? "text-green-600" : "text-blue-600"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="30"
          cx="40"
          cy="40"
        />
      </svg>
      <span className="absolute text-xl text-green-700" x-text="100%">
        {percent === 100 ? <CheckIcon width={40} /> : null}
      </span>
    </div>
  );
};

export default ProgressRing;
