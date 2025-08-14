"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { config, networks, projectId, wagmiAdapter } from "@/config";
import { mainnet } from "@reown/appkit/networks";

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

// Initialize AppKit outside the component render cycle
if (!projectId) {
  console.error("AppKit Initialization Error: Project ID is missing.");
} else {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId!,
    networks: networks,
    defaultNetwork: mainnet,
    metadata,
    features: { analytics: true },
  });
}

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  // Calculate initial state for Wagmi SSR hydration
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
