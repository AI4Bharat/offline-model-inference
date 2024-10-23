"use client";

// import * as wasm from "indicasr-web";
import { Backdrop, CircularProgress } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import dynamic from "next/dynamic";
import Image from "next/image";
import Script from "next/script";
import { useState } from "react";
// import Model from "./components/model";
import styles from "./page.module.css";

const Model = dynamic(() => import("../app/components/model"), { ssr: false });

export default function Home() {
  const [ortLoaded, setOrtLoaded] = useState(false);
  // useEffect(() => {
  //   test();
  // });
  // const test = () => {
  //   wasm.greet();
  // };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js" // Replace with your CDN URL
        strategy="lazyOnload" // Change the loading strategy if needed
        onLoad={() => {
          setOrtLoaded(true);
        }}
      />
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={!ortLoaded}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <AppRouterCacheProvider>
        <div className={styles.page}>
          <main className={styles.main}>
            <Image
              className={styles.logo}
              src="https://ai4bharat.iitm.ac.in/assets/logos/ai4b-logo.png"
              alt="Next.js logo"
              width={180}
              height={180}
              priority
            />
            <h2>AI4Bharat Offline ASR Model Demo</h2>
            <Model />
          </main>
          <footer className={styles.footer}>
            <a
              href="https://github.com/AI4Bharat/offline-model-inference"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="https://nextjs.org/icons/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Github
            </a>
            <a
              href="https://ai4bharat.iitm.ac.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="https://nextjs.org/icons/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              ai4bharat.iitm.ac.in →
            </a>
          </footer>
        </div>
      </AppRouterCacheProvider>
    </>
  );
}
