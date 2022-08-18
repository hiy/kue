type Props = {
  style?: React.CSSProperties;
  className?: string;
  message?: string;
};

const LoadingIcon = (props: Props) => {
  return (
    <div style={props.style} className={props.className}>
      <div className="flex flex-col">
        <div className="flex justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 rounded-full border-t-transparent"></div>
        </div>
        <div className="flex justify-center mt-3 text-gray-600">
          <div>{props.message}</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIcon;
