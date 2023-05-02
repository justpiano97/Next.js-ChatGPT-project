import React from "react";
import Head from "next/head";

import MainLayout from "../src/layout/MainLayout";
import styles from "@/styles/Home.module.css";

export default function Plan() {
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
                <p className="px-4 mt-12 text-2xl text-center 2xl:mt-0 xl:mt-0 md:mt-0 sm:mt-12">Terms & Policy</p>
              </div>
            </div>
          </div>
        </MainLayout>
      </main>
    </>
  );
}
