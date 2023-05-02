import React, { Fragment, useContext } from "react";
import { MainContext } from "../../../layout/MainContextProvider";
import { Popover, Transition } from "@headlessui/react";
import { BeatLoader } from "react-spinners";

interface ReferenceInt {
  content: string;
  id: number;
  page_num: number;
}

interface MessageProps {
  type?: "FROM_CHATGPT" | "FROM_ME";
  message?: string;
  isLoading?: boolean;
  refernces?: ReferenceInt[];
}

const Message: React.FC<MessageProps> = ({ type = "FROM_CHATGPT", message = "", refernces, isLoading = false }) => {
  const { setShowPdf, setPageNum } = useContext(MainContext);
  return isLoading ? (
    <div
      className={`relative px-8 py-4 text-sm rounded-lg shadow-sm w-fit break-words max-w-full ${
        type === "FROM_CHATGPT" ? "bg-white dark:bg-primary" : "bg-secondary dark:bg-bgRadialStart"
      }`}
    >
      <BeatLoader size={4} color="#A5D7E8" />
    </div>
  ) : (
    <div className={`flex ${type === "FROM_CHATGPT" ? "justify-start" : "justify-end"} w-full`}>
      <div
        className={`relative px-8 py-4 text-sm rounded-lg shadow-sm w-fit break-words max-w-full ${
          type === "FROM_CHATGPT" ? "bg-white dark:bg-primary" : "bg-secondary dark:bg-bgRadialStart"
        }`}
      >
        <pre className="w-full break-words ">{message ?? ""}</pre>
        {type === "FROM_CHATGPT" && (
          <div className="text-end">
            <Popover className="relative">
              <Popover.Button className="border-none outline-none ring-0">
                <span> {!!refernces?.length ? `${refernces.length} references` : ""}</span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute z-10 w-full max-w-full px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0">
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative space-y-2 overflow-auto bg-white dark:bg-bgRadialStart p-7 h-36">
                      {refernces?.map((item) => (
                        <div key={item.id} className="text-right">
                          <a
                            className="text-right text-blue-800 border-b cursor-pointer dark:text-white"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setShowPdf(true);
                              setPageNum(item.page_num);
                            }}
                          >{`Page #${item.page_num}`}</a>
                          <p className="mt-1 text-left">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        )}
        {type === "FROM_CHATGPT" ? (
          <div className="absolute rotate-45 bg-white dark:bg-primary rounded-sm top-3 w-6 h-6 -left-2.5"></div>
        ) : (
          <div className="absolute -rotate-45 bg-secondary dark:bg-bgRadialStart  rounded-sm top-3 w-6 h-6 -right-2.5"></div>
        )}
      </div>
    </div>
  );
};

export default Message;
