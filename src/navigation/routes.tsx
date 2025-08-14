import type { ComponentType, JSX } from "react";

import { IndexPage } from "@/pages/IndexPage/IndexPage";
import { InitDataPage } from "@/pages/InitDataPage.tsx";
import { LaunchParamsPage } from "@/pages/LaunchParamsPage.tsx";
import { ThemeParamsPage } from "@/pages/ThemeParamsPage.tsx";
import { SignMessagePage } from "@/pages/SignMessagePage/SignMessagePage";
import { SendTransactionPage } from "@/pages/SendTransactionPage/SendTransactionPage";
import { TransactionTesterPage } from "@/pages/TransactionTesterPage/TransactionTesterPage";
import { AuthPage } from "@/pages/AuthPage/AuthPage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/auth", Component: AuthPage, title: "SIWE Auth" },
  { path: "/init-data", Component: InitDataPage, title: "Init Data" },
  { path: "/theme-params", Component: ThemeParamsPage, title: "Theme Params" },
  {
    path: "/launch-params",
    Component: LaunchParamsPage,
    title: "Launch Params",
  },
  {
    path: "/sign-message",
    Component: SignMessagePage,
    title: "Sign Message",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    path: "/send-transaction",
    Component: SendTransactionPage,
    title: "Send Transaction",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17l9.2-9.2M17 8v9h-9" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
  },
  {
    path: "/transaction-tester",
    Component: TransactionTesterPage,
    title: "TX Tester",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
        <path d="M12 9V3" />
        <path d="M12 21v-6" />
      </svg>
    ),
  },
];
