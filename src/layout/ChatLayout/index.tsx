import React, { useContext, useEffect, useRef, useState } from "react";
import * as uuid from "uuid";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { ScaleLoader } from "react-spinners";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { type TextItem } from "pdfjs-dist/types/src/display/api";

import FileTab from "../../components/ui/FileTab";
import Message from "../../components/ui/Message";
import Modal from "../../components/basic/Modal";
import MyDropzone from "../../components/basic/Dropzone";
import Reply from "../../assets/svg/reply.svg";
import { AuthContext } from "../AuthContextProvider";
import { FileType, MainContext } from "../MainContextProvider";
import { MessageItem } from "../MainContextProvider";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;

import "react-pdf/dist/esm/Page/TextLayer.css";
import Link from "next/link";

const ChatLayout: React.FC = () => {
  const { tokens, user } = useContext(AuthContext);
  const { showPdf, setShowPdf, showSetting, files, setFiles, setShowSetting, pageNum, setRecent } =
    useContext(MainContext);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>();
  const sentenceRef = useRef<string[]>();
  const settings = useRef<any>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [botmsg, setbotmsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSaveErroModal, setShowSaveErrorModal] = useState(false);
  const [erroMsg, setErrorMessage] = useState("");
  const [file, setFile] = useState<FileType>();
  const [messages, setMessages] = useState<MessageItem[]>([]);

  function scrollToPage(num: number) {
    if (pdfRef?.current?.pages?.length > 0) {
      pdfRef?.current?.pages[num - 1]?.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (!files?.length) {
      const uid = uuid.v4();
      const newObj = {
        order: 1,
        name: "New",
        uid: uid,
        file: undefined,
        ip: "",
        s3_url: "",
        active: true,
        messages: [],
        isEmbedded: false,
      };
      setFiles([newObj]);
      setFile(newObj);
    } else {
      const actived = files?.find((item) => item.active);
      setFile(actived);
      setMessages(actived?.messages ?? []);
      if (actived?.file) {
        setShowPdf(true);
      } else {
        setShowPdf(false);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("files", JSON.stringify(files));
    }
  }, [files]);

  useEffect(() => {
    if (pageNum > 1) {
      scrollToPage(pageNum ?? 1);
    }
  }, [pageNum]);

  useEffect(() => {
    if (botmsg) {
      onSend("Hey There!!");
      setbotmsg(false);
    }
  }, [botmsg]);

  useEffect(() => {
    const localSettings = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("settings") as string) : "";
    if (!localSettings) {
      setShowSetting(true);
    } else {
      settings.current = localSettings;
    }
  }, [showSetting]);

  async function generateEmbedding(sentenceList: any[]) {
    if (sentenceList[sentenceList.length - 1].pageNum > (user?.Plan.pages ?? 120)) {
      setErrorMessage(`Can't be processed, pdf has more than ${user?.Plan.pages ?? 120} pages`);
      setShowSaveErrorModal(true);
      return;
    }

    const apiKey = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("settings") as string).apiKey : "";
    if (!apiKey) {
      setShowSetting(true);
      return;
    }
    try {
      setLoading(true);
      let uid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;
      if (!uid) {
        uid = uuid.v4();
        localStorage.setItem("uid", uid);
      }
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/history/embedding`, {
          sentence_list: sentenceList,
          ip: user ? user.id : uid,
          file_name: `${file?.uid}-${file?.name}`,
          apiKey: apiKey,
        });
        setAlertMessage("Processing done...Now you can Do Q & A with chatbot");
        setbotmsg(true);
        setShowAlert(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }

      if (user) {
        try {
          const formData = new FormData();
          if (file?.file) {
            formData.append("file", file?.file);
          }
          formData.append("name", `${file?.name}`);
          formData.append("uid", `${file?.uid}`);
          formData.append("total_pages", `${file?.total_pages}`);
          formData.append("messages", JSON.stringify(file?.messages));
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/history`, formData, {
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
          });
          const history = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/history`, {
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
          });
          setRecent(history?.data?.documents ?? []);
          toast("File upload is succed");
        } catch (error) {
          toast("File upload is faild");
        }
      }
    } catch (error) {
      toast("You have reached you api limits, Try after sometime.");
      return;
    }
  }

  async function onDocumentLoadSuccess(doc: any) {
    const { numPages } = doc;
    const allSentenceList = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const currentPage = await doc.getPage(pageNum);
      const currentPageContent = await currentPage.getTextContent();
      const currentPageText = currentPageContent.items.map((item: any) => (item as TextItem).str).join(" ");
      allSentenceList.push({ sentence: currentPageText, pageNum });
    }
    // @ts-ignore
    sentenceRef.current = allSentenceList.filter((item) => {
      return item.sentence;
    });

    setFiles((prev: FileType[]) => {
      const newFiles = prev;
      const index = prev.findIndex((item) => item.active);
      if (index > -1) {
        newFiles[index].total_pages = numPages;
      }
      return newFiles;
    });

    setShowPdf(true);
    const apiKey = typeof window !== "undefined" && JSON.parse(localStorage.getItem("settings") as string)?.apiKey;
    if (!file?.isEmbedded && apiKey) {
      generateEmbedding(sentenceRef.current as string[]);
      setFiles((prev: FileType[]) => {
        const newFiles = prev;
        const index = prev.findIndex((item) => item.active);
        if (index > -1) {
          newFiles[index].isEmbedded = true;
        }
        return newFiles;
      });
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatWindow = chatWindowRef.current;

      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight + 300;
      }
    }, 0);
  };

  const onReply = async (value: string) => {
    if (value == "Hey There!!") {
      value = `Summarize pdf in 3 sentance and generate 3 try out questions but do not provide answers, Append "Hey there!, you have uploaded ${file?.name}"in  first line`;
    }
    try {
      setLoading(true);
      const embedRes = await axios(`${process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT}/search-embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          query: value,
          apiKey: settings.current?.apiKey,
          matches: 5,
          ip: user ? user.id : localStorage.getItem("uid"),
          fileName: `${file?.uid}-${file?.name}`,
        },
      });

      const promptData = embedRes.data?.map((d: any) => d.content).join("\n\n");
      const prompt = `${value}, Use the following text to provide an answer, Text: ${promptData}`;

      const answerResponse = await fetch(`${process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT}/search-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, apiKey: settings.current?.apiKey }),
      });
      setLoading(false);

      if (!answerResponse.ok) {
        throw new Error(answerResponse.statusText);
      }

      const data = answerResponse.body;
      if (!data) {
        throw new Error("No data");
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...prev.at(-1),
            type: "REPLY",
            message: prev.at(-1)?.message + chunkValue,
            references: embedRes.data,
          },
        ]);
        setFiles((prev: FileType[]) => {
          const index = prev.findIndex((item) => item.active);
          const newFiles = prev;
          if (index > -1) {
            newFiles[index].messages = [
              ...prev[index].messages.slice(0, -1),
              {
                ...prev[index].messages.at(-1),
                type: "REPLY",
                message: prev[index].messages.at(-1)?.message + chunkValue,
                references: embedRes.data,
              },
            ];
          }
          return newFiles;
        });
        requestAnimationFrame(() => scrollToBottom());
      }
      localStorage.setItem("files", JSON.stringify(files));
      scrollToBottom();
    } catch (error) {
      setLoading(false);
    }
  };

  const onSend = async (value: string) => {
    if (!value) return;
    setQuestion("");
    if (!settings.current?.apiKey) {
      return;
    }
    setMessages((prev) => [...prev, { type: "QUESTION", message: value.trim() }, { type: "REPLY", message: "" }]);
    setFiles((prev: FileType[]) => {
      const index = prev.findIndex((item) => item.active);
      const newFiles = prev;
      if (index > -1) {
        newFiles[index].messages = [
          ...prev[index].messages,
          { type: "QUESTION", message: value.trim() },
          { type: "REPLY", message: "" },
        ];
      }
      return newFiles;
    });

    scrollToBottom();
    await onReply(value);
  };

  return (
    <div className="relative w-full h-full md:flex">
      <FileTab loading={loading} setShowSaveErrorModal={setShowSaveErrorModal} setErrorMessage={setErrorMessage} />
      {file && (
        <div
          className={`relative ${
            showPdf && file ? "w-full md:w-1/2 h-full" : "w-full"
          } h-full dark:bg-bgRadialEnd  bg-lightText dark:bg-gradient-radial duration-300 transition-all`}
        >
          <div
            className="flex w-full h-full px-4 pt-20 pb-20 overflow-x-hidden overflow-y-auto md:pt-10 xl:pt-20"
            ref={chatWindowRef}
          >
            {file?.file || file?.s3_url ? (
              <div className="relative w-full h-full mx-auto max-w-1180">
                <div className="pt-12 pb-40 space-y-8 md:pb-32 md:pt-0">
                  {!!messages.length &&
                    messages.map((message, index) => (
                      <Message
                        key={index}
                        type={message?.type === "REPLY" ? "FROM_CHATGPT" : "FROM_ME"}
                        message={message?.message}
                        isLoading={loading && index === file.messages.length - 1}
                        refernces={message?.type === "REPLY" ? message?.references : []}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <MyDropzone />
            )}
          </div>
          <div className="absolute bottom-0 w-full pb-8 px-3.5 xl:pl-0 xl:pr-3 -translate-x-1/2 max-w-[1300px] bg-lightText dark:bg-bgRadialEnd left-1/2">
            <div className="w-full mx-auto bg-lightText dark:bg-transparent max-w-1180">
              <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border rounded-lg dark:bg-transparent border-primary dark:border-semiLightText">
                <input
                  type="text"
                  className="w-full bg-transparent outline-none ring-0 disabled:cursor-not-allowed"
                  value={question}
                  disabled={(!file.file && !file.s3_url) || loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSend(question);
                    }
                  }}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                {loading ? (
                  <ScaleLoader color="#A5D7E8" loading={loading} width={2} height={16} />
                ) : (
                  <button
                    disabled={(!file.file && !file.s3_url) || loading}
                    onClick={() => {
                      onSend(question);
                    }}
                    className="color-white"
                  >
                    <Reply />
                  </button>
                )}
              </div>
              <p className="w-full mt-1 text-sm text-center text-semiLightText md:text-start">
                For free version we only provide you to upload less then 1000 pages file For business purpose, Contact
                us at pdfgpt@gmail.com
              </p>
            </div>
          </div>
        </div>
      )}
      {(file?.file || file?.s3_url) && showPdf && (
        <div
          className={`w-full px-8 pt-12 pb-16 h-full md:w-1/2 bg-primary fixed md:relative top-0 ${
            showPdf && file ? "fixed md:relative" : "hidden"
          }`}
        >
          <button onClick={() => setShowPdf(false)} className="float-right">
            <XCircleIcon className="w-8" />
          </button>
          <p className="text-center text-lightText">{file?.name}</p>
          <div className="w-full h-full mt-4 overflow-auto bg-white">
            <Document
              ref={pdfRef}
              file={file?.s3_url ? file?.s3_url : file?.file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => {}}
            >
              {Array.from(new Array(file.total_pages), (_el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={720} renderAnnotationLayer={false} />
              ))}
            </Document>
          </div>
        </div>
      )}
      <Modal isOpen={showAlert} setIsOpen={setShowAlert}>
        <div className="w-full max-w-lg text-bgRadialEnd">
          <p>{alertMessage}</p>
          <div className="flex justify-center gap-5 mt-5">
            <button className="px-4 py-2 rounded-md text-bgRadialEnd bg-third" onClick={() => setShowAlert(false)}>
              OK
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showSaveErroModal} setIsOpen={setShowSaveErrorModal}>
        <div className="w-full max-w-lg text-bgRadialEnd">
          <p className="text-center">{erroMsg}</p>
          <div className="flex justify-center gap-5 mt-5">
            <Link href="/plan" className="px-4 py-2 rounded-md text-bgRadialEnd bg-third">
              Go to Plan
            </Link>
            <button
              className="px-4 py-2 rounded-md text-bgRadialEnd bg-third"
              onClick={() => {
                setShowSaveErrorModal(false);
              }}
            >
              Cacel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatLayout;
