import React, { useState } from "react";
import { useRouter } from "next/router";

import { QRCodeSVG } from "qrcode.react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { CheckIcon } from "@heroicons/react/solid";

const ShareLink = () => {
  const router = useRouter();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openQRcodeModal, setOpenQRcodeModal] = useState(false);

  return (
    <>
      <p className="mb-2 font-bold">Share URL</p>
      <QRCodeSVG
        style={{ width: "100%", height: "auto" }}
        value={process.env.NEXT_PUBLIC_HOST + router.asPath}
      />

      <div className="mt-2 flex justify-center">
        <div className="flex flex-col">
          <button
            onClick={() => setOpenQRcodeModal(true)}
            className="bg-blue-400 hover:bg-blue-300 text-white rounded px-4 py-1 mb-2">
            <span>Expand QR code</span>
          </button>

          <CopyToClipboard text={process.env.NEXT_PUBLIC_HOST + router.asPath}>
            <button
              onClick={() => setCopiedUrl(true)}
              className={
                copiedUrl
                  ? "bg-green-400 hover:bg-green-300 text-white rounded px-4 py-1"
                  : "bg-gray-400 hover:bg-gray-300 text-white rounded px-4 py-1"
              }>
              <div className="flex justify-between cursor-copy">
                <span>Copy URL</span>
                {copiedUrl ? (
                  <span className="ml-2 mt-1">
                    <CheckIcon width={20}></CheckIcon>
                  </span>
                ) : null}
              </div>
            </button>
          </CopyToClipboard>
        </div>
      </div>

      {/* QRコードのモーダル */}
      <div
        className={`relative z-10 ${openQRcodeModal ? "" : "hidden"}`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="flex justify-center ">
                      <div className="w-screen">
                        <QRCodeSVG
                          style={{ width: "100%", height: "auto" }}
                          value={process.env.NEXT_PUBLIC_HOST + router.asPath}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setOpenQRcodeModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareLink;
