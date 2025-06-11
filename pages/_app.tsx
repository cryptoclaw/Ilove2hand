// pages/_app.tsx
"use client";

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import Head from "next/head";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// สร้าง instance เดียวตลอดแอป
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ครอบด้วย React Query provider */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
