import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
} from "@reown/appkit-siwe";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";
import { networkIds } from "./index";

export const siweConfig = createSIWEConfig({
  sessionRefetchIntervalMs: 1000 * 60 * 5,
  nonceRefetchIntervalMs: 1000 * 60 * 5,
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  required: true,
  enabled: true,
  onSignIn: (session) => {
    console.log("SIWE Sign In:", session);
    // TODO: Handle session storage if needed
  },
  onSignOut: () => {
    console.log("SIWE Sign Out");
    // TODO: Clear session storage if needed
  },
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: networkIds,
    statement: "Please sign with your account",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async (_address?: string) => {
    // For now, we'll use the nonce from URL params (passed from bot)
    // In production, you might want to fetch this from your backend
    const urlParams = new URLSearchParams(window.location.search);
    const nonce = urlParams.get("nonce") || crypto.randomUUID();
    return nonce;
  },
  getSession: async () => {
    // For this implementation, we don't persist sessions
    // You can implement session storage here if needed
    return null;
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      console.log("Verifying SIWE message:", { message, signature });
      // For demo purposes, we'll return true
      // In production, you should verify the signature server-side
      return true;
    } catch (error: unknown) {
      console.error("SIWE verification failed:", error);
      return false;
    }
  },
  signOut: async () => {
    try {
      console.log("SIWE Sign Out requested");
      return true;
    } catch (error: unknown) {
      console.error("SIWE sign out failed:", error);
      return false;
    }
  },
});
