import React from "react";

const ReloadPrompt = () => {
  return (
    <>
      <div className="flex justify-center">
        <p>
          Sorry. There seems to have been some error. Reloading may fix it,
          please try reloading.
        </p>
      </div>

      <div className="flex justify-center mt-5">
        <div>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-300 text-white rounded px-4 py-2">
            Reload
          </button>
        </div>
      </div>
    </>
  );
};

export default ReloadPrompt;
