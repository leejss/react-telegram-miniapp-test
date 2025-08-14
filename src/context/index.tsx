"use client";

import { config, networks, wagmiAdapter } from "@/config";
import { siweConfig } from "@/config/siwe";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";

const queryClient = new QueryClient();

const metadata = {
  name: "Telegram Mini App",
  description: "Telegram Mini App with Web3 SignMessage",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://telegram-mini-apps.github.io/reactjs-template",
  icons: ["https://telegram-mini-apps.github.io/reactjs-template/icon.png"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: import.meta.env.VITE_PROJECT_ID || "",
  networks: networks,
  metadata,
  siweConfig,
});

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(config as Config, cookies);
  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
