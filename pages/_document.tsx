import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Chat With PDF" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          key="1"
          name="description"
          content="Get instant answers to all your PDF-related questions with our cutting-edge chat tool. Simply upload your PDF and start chatting - our tool has you covered! Say goodbye to the frustration of navigating complex PDFs and get the answers you need quickly and easily. Try it today and experience the power of our PDF chat tool!"
        />
        <meta
          key="6"
          name="keywords"
          content="Chat with pdf, pdf chat, chatpdf,pdf gpt, pdfgpt, openai toop tool, top pdf chat tool, PDF extraction tool, Chatbot PDF extractor, PDF data extraction, PDF text extraction, PDF parsing tool, Chat-based PDF data mining, PDF information retrieval, PDF search engine, Conversational PDF extraction, Intelligent PDF processing"
        />
        <meta key="6" name="title" content="Pdfgpt.io - Chat with pdf" />

        <meta
          key="2"
          property="og:title"
          content="Revolutionize your PDF experience - chat with our tool for fast, accurate answers!"
        />
        <meta
          key="3"
          property="og:description"
          content="Get instant answers to all your PDF-related questions with our cutting-edge chat tool. Simply upload your PDF and start chatting - our tool has you covered! Say goodbye to the frustration of navigating complex PDFs and get the answers you need quickly and easily. Try it today and experience the power of our PDF chat tool!"
        />
        <meta key="4" property="og:url" content="http://pdfgpt.io/" />
        <meta key="5" property="og:type" content="website"></meta>
        <meta name="google-site-verification" content="-7ltI58DQMEKPpH1OUDkwFrY-9aAAnPN29R-Li__0Ss" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8782294691185847"
          // @ts-ignore
          crossOrigin="anonymous"
        ></script>
      </Head>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-K9HL6RWLFD"></script>
      <Script id="google-analytics" strategy="afterInteractive">
        {` window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-K9HL6RWLFD');`}
      </Script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
