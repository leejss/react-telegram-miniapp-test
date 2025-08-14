import { FC, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { siweConfig } from "@/config/siwe";
import {
  initDataStartParam,
  sendData,
  miniApp,
  popup,
} from "@telegram-apps/sdk";
import { Page } from "@/components/Page";
import {
  Button,
  Text,
  Title,
  Caption,
  Section,
} from "@telegram-apps/telegram-ui";

interface AuthState {
  step: "connecting" | "signing" | "sending" | "completed" | "error";
  message?: string;
  nonce?: string;
  signature?: string;
}

export const AuthPage: FC = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open } = useAppKit();
  const [authState, setAuthState] = useState<AuthState>({ step: "connecting" });

  useEffect(() => {
    // Get nonce from start params inside useEffect
    const startParam = initDataStartParam();
    console.log("🔍 [SIWE FLOW] Step 1: Checking start params...");
    console.log("🌐 [SIWE FLOW] Current URL:", window.location.href);
    console.log("🌐 [SIWE FLOW] URL search params:", window.location.search);
    console.log("🌐 [SIWE FLOW] URL hash:", window.location.hash);

    // Alternative way to get start params
    // const urlParams = new URLSearchParams(window.location.search);
    // const startAppParam = urlParams.get("startapp");
    // console.log("🔍 [SIWE FLOW] startapp from URL:", startAppParam);

    // // Check Telegram WebApp data
    // if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
    //   const tgWebApp = (window as any).Telegram.WebApp;
    //   console.log(
    //     "📱 [SIWE FLOW] Telegram WebApp start param:",
    //     tgWebApp.initDataUnsafe?.start_param,
    //   );
    //   console.log(
    //     "📱 [SIWE FLOW] Telegram WebApp initData:",
    //     tgWebApp.initData,
    //   );
    // }

    if (startParam) {
      try {
        console.log("📝 [SIWE FLOW] Raw start param received:", startParam);
        const parsedParam = JSON.parse(startParam);
        console.log("📝 [SIWE FLOW] Parsed start param:", parsedParam);

        if (parsedParam && parsedParam.nonce) {
          console.log(
            "✅ [SIWE FLOW] Nonce extracted successfully:",
            parsedParam.nonce,
          );
          setAuthState((prev) => ({ ...prev, nonce: parsedParam.nonce }));
          console.log("🔄 [SIWE FLOW] Auth state updated with nonce");
        } else {
          console.error("❌ [SIWE FLOW] No nonce found in start params");
          if (popup.open.isAvailable()) {
            popup.open({
              title: "Error",
              message: "No nonce found in start parameters.",
              buttons: [{ id: "ok", type: "default", text: "OK" }],
            });
          }
        }
      } catch (error) {
        console.error("❌ [SIWE FLOW] Failed to parse start params:", error);
        if (popup.open.isAvailable()) {
          popup.open({
            title: "Error",
            message: "Failed to parse start parameters.",
            buttons: [{ id: "ok", type: "default", text: "OK" }],
          });
        }
        // Fallback: treat startParam as nonce directly (for backward compatibility)
        console.log(
          "🔄 [SIWE FLOW] Using fallback: treating startParam as nonce directly",
        );
        setAuthState((prev) => ({ ...prev, nonce: startParam }));
      }
    } else {
      console.log("⚠️ [SIWE FLOW] No start params from initDataStartParam()");

      // Fallback: try to get from URL directly
      const urlParams = new URLSearchParams(window.location.search);
      const startAppParam = urlParams.get("startapp");

      if (startAppParam) {
        console.log("🔄 [SIWE FLOW] Found startapp in URL, trying to parse...");
        try {
          const decoded = decodeURIComponent(startAppParam);
          console.log("🔄 [SIWE FLOW] Decoded URL param:", decoded);
          const parsedParam = JSON.parse(decoded);
          if (parsedParam && parsedParam.nonce) {
            console.log(
              "✅ [SIWE FLOW] Nonce extracted from URL fallback:",
              parsedParam.nonce,
            );
            setAuthState((prev) => ({ ...prev, nonce: parsedParam.nonce }));
          }
        } catch (error) {
          console.error("❌ [SIWE FLOW] Failed to parse URL fallback:", error);
        }
      } else {
        console.log("⚠️ [SIWE FLOW] No startapp parameter found in URL");
      }
    }
  }, []); // 빈 dependency array로 한 번만 실행

  useEffect(() => {
    console.log("🔍 [SIWE FLOW] Step 2: Checking wallet connection...");
    console.log("📊 [SIWE FLOW] Current state:", {
      isConnected,
      address,
      hasNonce: !!authState.nonce,
      authStep: authState.step,
    });

    if (isConnected && address && authState.nonce) {
      console.log("✅ [SIWE FLOW] All conditions met, starting SIWE flow...");
      handleSIWEFlow();
    } else {
      console.log("⚠️ [SIWE FLOW] Waiting for conditions:", {
        needsConnection: !isConnected,
        needsAddress: !address,
        needsNonce: !authState.nonce,
      });
    }
  }, [isConnected, address, authState.nonce]);

  const handleSIWEFlow = async () => {
    console.log("🚀 [SIWE FLOW] Step 3: Starting SIWE message creation...");
    if (!address || !authState.nonce) {
      console.error("❌ [SIWE FLOW] Missing required data:", {
        address,
        nonce: authState.nonce,
      });
      return;
    }

    try {
      console.log("🔄 [SIWE FLOW] Setting state to 'signing'...");
      setAuthState((prev) => ({ ...prev, step: "signing" }));

      // Create SIWE message according to the specified format
      console.log(
        "📝 [SIWE FLOW] Getting message parameters from siweConfig...",
      );
      const messageParams = await siweConfig.getMessageParams!();
      console.log("📝 [SIWE FLOW] Message params received:", messageParams);

      const chainId = messageParams.chains[0];
      const issuedAt = new Date().toISOString();
      console.log("📝 [SIWE FLOW] Chain ID:", chainId, "Issued At:", issuedAt);

      // Format message exactly as specified in the requirements
      const message = `I wants you to sign in with your Ethereum account:
${address}

Please sign with your account

URI: ${messageParams.uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${authState.nonce}
Issued At: ${issuedAt}`;

      console.log("📝 [SIWE FLOW] Generated SIWE message:", message);
      setAuthState((prev) => ({ ...prev, message }));

      // Sign the message
      console.log("✍️ [SIWE FLOW] Step 4: Requesting signature from wallet...");
      const signature = await signMessageAsync({ message });
      console.log("✅ [SIWE FLOW] Signature received:", signature);

      console.log("🔄 [SIWE FLOW] Setting state to 'sending'...");
      setAuthState((prev) => ({ ...prev, signature, step: "sending" }));

      // Send data to bot using Telegram Mini App SDK
      console.log("📦 [SIWE FLOW] Step 5: Preparing data for bot...");
      const dataToSend = JSON.stringify({
        type: "WALLET_LINK",
        payload: {
          address,
          signature,
          message,
        },
      });

      console.log("📤 [SIWE FLOW] Data to send:", dataToSend);

      if (sendData.isAvailable()) {
        console.log("📡 [SIWE FLOW] Sending data to bot...");
        sendData(dataToSend);
        console.log("✅ [SIWE FLOW] Data sent successfully!");

        console.log("🔄 [SIWE FLOW] Setting state to 'completed'...");
        setAuthState((prev) => ({ ...prev, step: "completed" }));

        // Close mini app after sending data
        console.log("⏰ [SIWE FLOW] Scheduling app close in 2 seconds...");
        setTimeout(() => {
          if (miniApp.close.isAvailable()) {
            console.log("🔚 [SIWE FLOW] Closing mini app...");
            miniApp.close();
          } else {
            console.log("⚠️ [SIWE FLOW] miniApp.close not available");
          }
        }, 2000);
      } else {
        console.error("❌ [SIWE FLOW] sendData is not available");
        const errorMessage =
          "sendData is not available - Mini app may not be launched from bot";
        if (popup.open.isAvailable()) {
          popup.open({
            title: "Error",
            message: errorMessage,
            buttons: [{ id: "ok", type: "default", text: "OK" }],
          });
        }
        setAuthState((prev) => ({
          ...prev,
          step: "error",
          message: errorMessage,
        }));
      }
    } catch (error) {
      console.error("❌ [SIWE FLOW] Error in SIWE flow:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (popup.open.isAvailable()) {
        popup.open({
          title: "Authentication Error",
          message: errorMessage,
          buttons: [{ id: "ok", type: "default", text: "OK" }],
        });
      }
      setAuthState((prev) => ({
        ...prev,
        step: "error",
        message: errorMessage,
      }));
    }
  };

  const connectWallet = () => {
    console.log("🔗 [SIWE FLOW] User clicked Connect Wallet button");
    console.log("🔗 [SIWE FLOW] Opening AppKit modal...");
    open();
  };

  const renderContent = () => {
    switch (authState.step) {
      case "connecting":
        if (!isConnected) {
          return (
            <Section>
              <Title level="2">Connect Your Wallet</Title>
              <Text>
                Please connect your wallet to continue with authentication.
              </Text>
              <Button onClick={connectWallet} size="l">
                Connect Wallet
              </Button>
              {authState.nonce && (
                <Caption>Nonce: {authState.nonce.substring(0, 8)}...</Caption>
              )}
            </Section>
          );
        }
        return (
          <Section>
            <Title level="2">Wallet Connected</Title>
            <Text>Address: {address}</Text>
            <Text>Preparing authentication...</Text>
            <Caption style={{ marginTop: "10px", color: "#666" }}>
              Debug: nonce={authState.nonce ? "✅" : "❌"} | address=
              {address ? "✅" : "❌"} | connected={isConnected ? "✅" : "❌"}
            </Caption>
          </Section>
        );

      case "signing":
        return (
          <Section>
            <Title level="2">Sign Message</Title>
            <Text>Please sign the message in your wallet to authenticate.</Text>
            <Section>
              <Title level="3">Message to sign:</Title>
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {authState.message}
              </Text>
            </Section>
          </Section>
        );

      case "sending":
        return (
          <Section>
            <Title level="2">Sending Authentication Data</Title>
            <Text>Sending signed message to bot...</Text>
          </Section>
        );

      case "completed":
        return (
          <Section>
            <Title level="2">Authentication Complete</Title>
            <Text>
              Successfully authenticated! The mini app will close shortly.
            </Text>
          </Section>
        );

      case "error":
        return (
          <Section>
            <Title level="2">Authentication Error</Title>
            <Text>Error: {authState.message}</Text>
            <Button onClick={() => window.location.reload()} size="l">
              Retry
            </Button>
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <Page>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        {renderContent()}
      </div>
    </Page>
  );
};
