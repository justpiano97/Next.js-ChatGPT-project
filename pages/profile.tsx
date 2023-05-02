import React from "react";
import Head from "next/head";

import MainLayout from "../src/layout/MainLayout";
import UserLayout from "../src/layout/UserLayout";
import styles from "@/styles/Home.module.css";

export default function Profile() {
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
          <UserLayout />
        </MainLayout>
      </main>
    </>
  );
}
