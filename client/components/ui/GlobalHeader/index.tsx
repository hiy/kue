import React, { useState } from "react";
import { CogIcon, CheckIcon } from "@heroicons/react/solid";

type Props = {
  onClickBrand?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onChangeConfig?: (config: { type: string; value?: number }) => void;
  config?: { cardPackType: number; isAnonymousMode: boolean };
};

const GlobalHeader = (props: Props) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900 cursor-pointer">
            <span onClick={props.onClickBrand}>Kue</span>
          </h1>
        </div>
      </div>
    </header>
  );

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            <span onClick={props.onClickBrand}>Kue</span>
          </h1>

          {false ? (
            <div>
              <div>
                {props.config && props.onChangeConfig ? (
                  <div className="dropdown relative">
                    <CogIcon
                      id="test"
                      onMouseEnter={() => setOpenDropdown(true)}
                      width={30}
                      className="text-gray-500 hover:text-gray-300"
                    />

                    <ul
                      onMouseEnter={() => setOpenDropdown(true)}
                      onMouseLeave={() => setOpenDropdown(false)}
                      className={`${
                        openDropdown ? "" : "hidden"
                      } absolute right-0 bg-white z-50  list-none text-left rounded-lg shadow-lg mt-1`}
                      aria-labelledby="dropdownMenuButton1">
                      <li>
                        <span className="font-bold text-sm py-2 px-4 block w-full whitespace-nowrap bg-transparent text-gray-700">
                          Card pack
                        </span>
                        <ul className="pl-2">
                          <li>
                            <div className="flex flex-row pl-2">
                              <span
                                onClick={(e) => {
                                  props.onChangeConfig!({
                                    type: "changePack",
                                    value: 0,
                                  });
                                  setOpenDropdown(false);
                                }}
                                className="mr-2 pl-3 text-sm font-normal whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100">
                                fibonacci seq
                              </span>
                              {props.config!.cardPackType === 0 ? (
                                <CheckIcon
                                  className="text-green-300"
                                  width={20}
                                />
                              ) : null}
                            </div>
                          </li>

                          <li>
                            <div className="flex flex-row pl-2">
                              <span
                                onClick={(e) => {
                                  props.onChangeConfig!({
                                    type: "changePack",
                                    value: 1,
                                  });
                                  setOpenDropdown(false);
                                }}
                                className="mr-2 pl-3 text-sm font-normal whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100">
                                fibonacci seq
                              </span>
                              {props.config!.cardPackType === 1 ? (
                                <CheckIcon
                                  className="text-green-300"
                                  width={20}
                                />
                              ) : null}
                            </div>
                          </li>

                          <li>
                            <div className="flex flex-row pl-2">
                              <span
                                onClick={(e) => {
                                  props.onChangeConfig!({
                                    type: "changePack",
                                    value: 2,
                                  });
                                  setOpenDropdown(false);
                                }}
                                className="mr-2 pl-3 text-sm font-normal whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100">
                                fibonacci seq
                              </span>
                              {props.config!.cardPackType === 2 ? (
                                <CheckIcon
                                  className="text-green-300"
                                  width={20}
                                />
                              ) : null}
                            </div>
                          </li>
                        </ul>
                      </li>

                      <li>
                        <span className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100">
                          <div className="flex flex-row">
                            <span
                              onClick={(e) => {
                                props.onChangeConfig!({
                                  type: "changeAnonymousMode",
                                });
                                setOpenDropdown(false);
                              }}
                              className="font-bold mr-2">
                              Anonymous mode
                            </span>
                            {props.config!.isAnonymousMode ? (
                              <CheckIcon
                                className="text-green-300"
                                width={20}
                              />
                            ) : null}
                          </div>
                        </span>
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
