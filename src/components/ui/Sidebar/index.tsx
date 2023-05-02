import React, { Fragment, useContext, useState } from "react";
import axios from "axios";
import * as uuid from "uuid";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  EllipsisHorizontalIcon,
  DocumentPlusIcon,
  EyeIcon,
  KeyIcon,
  CurrencyDollarIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  DocumentTextIcon,
  Bars3Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import Accordion from "../../basic/Accordion";
import Drawer from "../../basic/Drawer";
import GoogleIcon from "../../../assets/svg/google.svg";
import Modal from "../../basic/Modal";
import { AuthContext } from "../../../layout/AuthContextProvider";
import { FileType, MainContext } from "../../../layout/MainContextProvider";
import { ScaleLoader } from "react-spinners";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export type DocumentType = { id: number; name: string; ip: string; s3_link: string; total_pages: number; uid: string };

const Sidebar = () => {
  const {
    isDarkTheme,
    toggleThemeHandler,
    showPdf,
    setShowPdf,
    setShowSetting,
    setDriveFiles,
    setFiles,
    files,
    recent,
    setRecent,
  } = useContext(MainContext);
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, setTokens, tokens } = useContext(AuthContext);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const toggleThemeHander = () => {
    toggleThemeHandler();
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      localStorage.setItem("googleAuthToken", tokenResponse?.access_token ?? "");
      try {
        const { data } = await axios.post("api/auth", { tokens: tokenResponse });
        setUser(data?.user);
        setDriveFiles(data?.files ?? []);
        setRecent(data?.recent ?? []);
        setTokens(data?.tokens);
        localStorage.setItem("refreshToken", data?.tokens?.refreshToken ?? "");
        localStorage.setItem("accessToken", data?.tokens?.accessToken ?? "");
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        setIsLoading(false);
      }
    },
  });

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    push("/");
  };

  const loadHistory = async (selected: DocumentType) => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/history/${selected.id}`, {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      setFiles((prev) => {
        const newFiles = prev
          .filter((item) => (item.file || item.s3_url) && item.uid !== selected.uid)
          .map((item) => ({ ...item, active: false }));
        newFiles.push({
          ...data,
          order: newFiles.length + 1,
        });
        return newFiles;
      });
      setShowPdf(true);
    } catch (error: any) {
      toast("Faild Fetching. " + error);
    }
  };

  const deleteHistory = async (selected: DocumentType) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/history/${selected.id}`, {
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
      setFiles((prev) => [...prev.filter((item) => item.uid !== selected.uid)]);
      toast("History is deleted");
    } catch (error: any) {
      toast("Faild Fetching. " + error);
    }
  };

  const addNewDocument = () => {
    if (files.length === 0 || files.at(-1)?.file || files.at(-1)?.s3_url) {
      setFiles((prev: FileType[]) => [
        ...prev.map((item: FileType) => ({ ...item, active: false })),
        {
          order: prev.length + 1,
          name: "New",
          uid: uuid.v4(),
          file: undefined,
          ip: "",
          s3_url: "",
          active: true,
          messages: [],
          isEmbedded: false,
        },
      ]);
      setShowPdf(false);
    }
  };

  return (
    <Fragment>
      <div className="hidden py-10 shadow-lg xl:py-20 md:w-24 xl:w-380 bg-primary md:flex">
        <div className="flex-col justify-between hidden w-full px-5 overflow-auto text-white xl:flex">
          <div className="mx-auto space-y-2 text-white text-md font-base">
            <button onClick={() => push("/")} className="flex items-center gap-3 hover:text-white">
              <HomeIcon className="w-6" />
              Home
            </button>
            <button onClick={addNewDocument} className="flex items-center gap-3 hover:text-white">
              <DocumentPlusIcon className="w-6" />
              New PDF
            </button>
            <button
              onClick={() => {
                setShowPdf((prev) => !prev);
              }}
              className="flex items-center gap-3 hover:text-white disabled:text-darkText disabled:cursor-not-allowed"
            >
              {!showPdf ? (
                <>
                  <EyeIcon className="w-6" />
                  Show PDF
                </>
              ) : (
                <>
                  <EyeSlashIcon className="w-6" />
                  Hide PDF
                </>
              )}
            </button>
            <button className="flex items-center gap-3 hover:text-white" onClick={() => setShowSetting(true)}>
              <KeyIcon className="w-6" />
              Change API Key
            </button>
            <button className="flex items-center gap-3 hover:text-white" onClick={() => push("/plan")}>
              <CurrencyDollarIcon className="w-6" />
              Pricing
            </button>
            {user && (
              <>
                <Accordion title="Recent">
                  <div className="w-32 ml-6 text-sm">
                    {recent.map((item, index) => (
                      <button
                        key={index}
                        className="py-0.5 cursor-pointer w-full gap-1 flex items-center"
                        onClick={() => loadHistory(item)}
                      >
                        <div className="flex-none">
                          <DocumentTextIcon className="w-5" />
                        </div>
                        <span className="flex-1 truncate whitespace-nowrap">{item?.name}</span>
                        <a
                          className="flex-none"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteHistory(item);
                          }}
                        >
                          <TrashIcon className="w-5" />
                        </a>
                      </button>
                    ))}
                  </div>
                </Accordion>
              </>
            )}
          </div>
          <div className="mt-10 text-md font-base">
            <button
              onClick={toggleThemeHander}
              className="flex items-center gap-3 mx-auto transition-all duration-300 hover:text-white text-darkText"
            >
              {!isDarkTheme ? <MoonIcon className="w-5" /> : <SunIcon className="w-6" />}
              {isDarkTheme ? "Light mode" : "Dark mode"}
            </button>
            {user ? (
              <div className="relative w-full py-3 mt-10 text-center text-white transition-all duration-300 rounded-full cursor-pointer bg-bgRadialEnd">
                <div className="absolute -translate-y-1/2 top-1/2 left-1">
                  <Image alt="avatar" src={user.picture} width={40} height={40} className="rounded-full"></Image>
                </div>
                <div className="ml-2">
                  <p>{user.name}</p>
                </div>
                <div className="absolute top-0 right-4">
                  <Menu>
                    <Menu.Button className="w-full px-2 py-2 text-right text-md">
                      <EllipsisHorizontalIcon className="w-8" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 p-2 text-sm text-right transform -translate-y-full rounded-lg shadow-lg w-fit bg-bgRadialStart top-4">
                      <Menu.Item>
                        <Link href="/profile">
                          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                            <UserIcon className="w-5" />
                            Profile
                          </div>
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button onClick={logout} className="flex items-center gap-2 px-2 pt-1 pb-2">
                          <ArrowRightOnRectangleIcon className="w-5" />
                          Logout
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="relative w-full py-3 mt-10 text-center text-white transition-all duration-300 bg-transparent border rounded-full cursor-pointer"
              >
                {isLoading ? (
                  <ScaleLoader color="#A5D7E8" loading={isLoading} width={2} height={16} />
                ) : (
                  <>
                    Login
                    <div className="absolute -translate-y-1/2 right-2 top-1/2">
                      <GoogleIcon />
                    </div>
                  </>
                )}
              </button>
            )}
            <div className="flex justify-between w-full mt-3 itmes-center">
              {[
                { link: "https://discord.gg/wQpAvefeqW", label: "Discord" },
                { link: "https://twitter.com/pdfgpt", label: "Twitter" },
                { link: "https://discord.gg/wQpAvefeqW", label: "Report Bug" },
                { link: "#", label: "Contact Us", onClick: () => setShowContactModal(true) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-xs transition-all duration-300 cursor-pointer hover:text-white text-darkText"
                >
                  <a href={item.link} onClick={item?.onClick}>
                    {item.label}
                  </a>
                </div>
              ))}
            </div>
            <div className="text-xs transition-all text-center mt-3 duration-300 cursor-pointer hover:text-white text-darkText">
              <Link href="/terms">Terms & Policy</Link>
            </div>
          </div>
        </div>
        <div className="justify-center hidden w-full xl:hidden md:flex">
          <button className="h-fit" onClick={() => setShowDrawer(true)}>
            <Bars3Icon className="w-6" />
          </button>
        </div>
      </div>
      <div className="fixed top-0 right-0 z-10 flex items-center justify-between w-full h-12 px-4 text-white md:hidden bg-primary">
        <button onClick={() => setShowDrawer(true)}>
          <Bars3Icon className="w-6" />
        </button>
        <button
          onClick={() => {
            setShowPdf((prev) => !prev);
          }}
          className="flex items-center gap-3 hover:text-white disabled:text-darkText disabled:cursor-not-allowed"
        >
          {!showPdf ? (
            <>
              <EyeIcon className="w-6" />
              Show PDF
            </>
          ) : (
            <>
              <EyeSlashIcon className="w-6" />
              Hide PDF
            </>
          )}
        </button>
      </div>
      <Modal isOpen={showContactModal} setIsOpen={setShowContactModal} title="Contact Us">
        <div className="mt-5 space-y-2">
          <p>
            Contact Us for queries/question:
            <a href="mailto:pdfgpt@gmail.com?subject=PDFGPTqueries" className="ml-2 border-b">
              Click here
            </a>
          </p>
          <p>
            Contact Us for Business Purpose:
            <a href="mailto:pdfgpt@gmail.com?subject=PDFGPTBusiness" className="ml-2 border-b">
              Click here
            </a>
          </p>
          <p>
            Join our discord:
            <a
              onClick={() => {
                window.open("https://discord.gg/wQpAvefeqW", "_blank");
              }}
              className="ml-2 border-b"
            >
              Join Discord
            </a>
          </p>
          <p>
            Or Write us at:
            <a href="mailto:pdfgpt@gmail.com?subject=PDFGPTOthers" className="ml-2 border-b">
              pdfgpt@gmail.com
            </a>
          </p>
          <p>Developer: Mihir Kanzariya: (kanzariyamihir@gmail.com)</p>
          <p>Email: kanzariyamihir@gmail.com</p>
        </div>
      </Modal>
      <Drawer isOpen={showDrawer} setIsOpen={setShowDrawer}>
        <div className="flex-col h-full justify-between flex w-full px-5 overflow-auto text-white xl:hidden">
          <div className="xl:mx-auto space-y-2 text-white text-md font-base">
            <button onClick={() => push("/")} className="flex items-center gap-3 hover:text-white">
              <HomeIcon className="w-6" />
              Home
            </button>
            <button onClick={addNewDocument} className="flex items-center gap-3 hover:text-white">
              <DocumentPlusIcon className="w-6" />
              New PDF
            </button>
            <button
              onClick={() => {
                setShowPdf((prev) => !prev);
              }}
              className="flex items-center gap-3 hover:text-white disabled:text-darkText disabled:cursor-not-allowed"
            >
              {!showPdf ? (
                <>
                  <EyeIcon className="w-6" />
                  Show PDF
                </>
              ) : (
                <>
                  <EyeSlashIcon className="w-6" />
                  Hide PDF
                </>
              )}
            </button>
            <button className="flex items-center gap-3 hover:text-white" onClick={() => setShowSetting(true)}>
              <KeyIcon className="w-6" />
              Change API Key
            </button>
            <button className="flex items-center gap-3 hover:text-white" onClick={() => push("/plan")}>
              <CurrencyDollarIcon className="w-6" />
              Pricing
            </button>
            {user && (
              <>
                <Accordion title="Recent">
                  <div className="w-32 ml-6 text-sm">
                    {recent.map((item, index) => (
                      <button
                        key={index}
                        className="py-0.5 cursor-pointer w-full gap-1 flex items-center"
                        onClick={() => loadHistory(item)}
                      >
                        <div className="flex-none">
                          <DocumentTextIcon className="w-5" />
                        </div>
                        <span className="flex-1 truncate whitespace-nowrap">{item?.name}</span>
                        <a
                          className="flex-none"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteHistory(item);
                          }}
                        >
                          <TrashIcon className="w-5" />
                        </a>
                      </button>
                    ))}
                  </div>
                </Accordion>
              </>
            )}
          </div>
          <div className="mt-10 text-md font-base">
            <button
              onClick={toggleThemeHander}
              className="flex items-center gap-3 mx-auto transition-all duration-300 hover:text-white text-darkText"
            >
              {!isDarkTheme ? <MoonIcon className="w-5" /> : <SunIcon className="w-6" />}
              {isDarkTheme ? "Light mode" : "Dark mode"}
            </button>
            {user ? (
              <div className="relative w-full py-3 mt-10 text-center text-white transition-all duration-300 rounded-full cursor-pointer bg-bgRadialEnd">
                <div className="absolute -translate-y-1/2 top-1/2 left-1">
                  <Image alt="avatar" src={user.picture} width={40} height={40} className="rounded-full"></Image>
                </div>
                <div className="ml-2">
                  <p>{user.name}</p>
                </div>
                <div className="absolute top-0 right-4">
                  <Menu>
                    <Menu.Button className="w-full px-2 py-2 text-right text-md">
                      <EllipsisHorizontalIcon className="w-8" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 p-2 text-sm text-right transform -translate-y-full rounded-lg shadow-lg w-fit bg-bgRadialStart top-4">
                      <Menu.Item>
                        <Link href="/profile">
                          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                            <UserIcon className="w-5" />
                            Profile
                          </div>
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button onClick={logout} className="flex items-center gap-2 px-2 pt-1 pb-2">
                          <ArrowRightOnRectangleIcon className="w-5" />
                          Logout
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="relative w-full py-3 mt-10 text-center text-white transition-all duration-300 bg-transparent border rounded-full cursor-pointer"
              >
                {isLoading ? (
                  <ScaleLoader color="#A5D7E8" loading={isLoading} width={2} height={16} />
                ) : (
                  <>
                    Login
                    <div className="absolute -translate-y-1/2 right-2 top-1/2">
                      <GoogleIcon />
                    </div>
                  </>
                )}
              </button>
            )}
            <div className="flex justify-between w-full mt-3 itmes-center">
              {[
                { link: "https://discord.gg/wQpAvefeqW", label: "Discord" },
                { link: "https://twitter.com/pdfgpt", label: "Twitter" },
                { link: "https://discord.gg/wQpAvefeqW", label: "Report Bug" },
                { link: "#", label: "Contact Us", onClick: () => setShowContactModal(true) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-xs transition-all duration-300 cursor-pointer hover:text-white text-darkText"
                >
                  <a href={item.link} onClick={item?.onClick}>
                    {item.label}
                  </a>
                </div>
              ))}
            </div>
            <div className="text-xs transition-all text-center mt-3 duration-300 cursor-pointer hover:text-white text-darkText">
              <Link href="/terms">Terms & Policy</Link>
            </div>
          </div>
        </div>
      </Drawer>
    </Fragment>
  );
};

export default Sidebar;
