import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";

import MainLayout from "../src/layout/MainLayout";
import styles from "@/styles/Home.module.css";
import PlanCardDetail from "../src/components/ui/PlanCardDetail";
import axios from "axios";
import { useRouter } from "next/router";
import { AuthContext } from "../src/layout/AuthContextProvider";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

export default function Plan() {
  const router = useRouter();
  const { tokens, user, setUser } = useContext(AuthContext);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<{ [key: string]: any }[]>([]);

  const handleChange = () => {
    setIsChecked((prevCheck) => !prevCheck);
  };

  const getPlan = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("api/stripe/plan", {
        token: tokens?.accessToken,
      });
      setPlans(data.data.plans);
    } catch (error) {
      setPlans([]);
    }
    setLoading(false);
  };

  const onSuccess = async () => {
    if (router.query?.session_id && user) {
      try {
        const { data: res } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_BASEURL}/subscription/success`,
          {
            session_id: router.query?.session_id,
          },
          {
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
          }
        );
        setUser(res.user);
      } catch (error: any) {
        toast("Fetching checkout session info faild. " + error?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (router.isReady) {
      getPlan();
      onSuccess();
    }
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>PDFGPT.IO - Experience PDFs like never before - chat with PDF for quick and easy answers!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <MainLayout>
          <div className="w-full h-full md:flex">
            <div className="w-full h-full py-10 overflow-auto transition-all duration-300 shadow-lg  dark:bg-bgRadialEnd bg-lightText dark:bg-gradient-radial xl:py-20">
              <div className="w-full mt-8 2xl:mt-0 xl:mt-0 md:mt-8 sm:mt-8">
                <p className="px-4 mt-12 text-2xl text-center 2xl:mt-0 xl:mt-0 md:mt-0 sm:mt-12">
                  Subscribe Now! - Because You Deserve More Than Just a One-Night Stand with PdfGPT
                </p>
                <div className="flex items-center justify-center my-10">
                  <p className={`mr-6 text-base font-medium ${isChecked ? "text-slate-400" : "dark:text-white"}`}>
                    Monthly
                  </p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      checked={isChecked}
                      onChange={handleChange}
                    />
                    <div className="w-12 h-6 p-2 rounded-full bg-blue-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-blue-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-blue-600 peer-checked:bg-blue-600"></div>
                  </label>
                  <p className={`ml-6 text-base font-medium ${isChecked ? "dark:text-white" : "text-slate-400"}`}>
                    Annual
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="flex flex-wrap justify-center gap-4 px-10">
                  <BeatLoader color="white" />
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 px-10">
                  {plans?.map((item: any, index: number) => (
                    <div key={index} className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 xl:w-1/4 2xl:w-1/4">
                      <div className="flex justify-center">
                        <PlanCardDetail data={item} isAnnual={isChecked} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </MainLayout>
      </main>
    </>
  );
}
