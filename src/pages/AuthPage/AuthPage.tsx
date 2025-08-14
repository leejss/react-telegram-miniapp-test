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

  // Get nonce from start params
  const startParam = initDataStartParam();

  useEffect(() => {
    if (startParam) {
      try {
        console.log("Start param:", startParam);
        const parsedParam = JSON.parse(startParam);
        if (parsedParam && parsedParam.nonce) {
          console.log("Extracted nonce:", parsedParam.nonce);
          setAuthState((prev) => ({ ...prev, nonce: parsedParam.nonce }));
        } else {
          console.error("No nonce found in start params");
          if (popup.open.isAvailable()) {
            popup.open({
              title: "Error",
              message: "No nonce found in start parameters.",
              buttons: [{ id: "ok", type: "default", text: "OK" }],
            });
          }
        }
      } catch (error) {
        console.error("Failed to parse start params:", error);
        if (popup.open.isAvailable()) {
          popup.open({
            title: "Error",
            message: "Failed to parse start parameters.",
            buttons: [{ id: "ok", type: "default", text: "OK" }],
          });
        }
        // Fallback: treat startParam as nonce directly (for backward compatibility)
        setAuthState((prev) => ({ ...prev, nonce: startParam }));
      }
    }
  }, [startParam]);

  useEffect(() => {
    if (isConnected && address && authState.nonce) {
      handleSIWEFlow();
    }
  }, [isConnected, address, authState.nonce]);

  const handleSIWEFlow = async () => {
    if (!address || !authState.nonce) return;

    try {
      setAuthState((prev) => ({ ...prev, step: "signing" }));

      // Create SIWE message according to the specified format
      const messageParams = await siweConfig.getMessageParams!();
      const chainId = messageParams.chains[0];
      const issuedAt = new Date().toISOString();

      // Format message exactly as specified in the requirements
      const message = `I wants you to sign in with your Ethereum account:
${address}

Please sign with your account

URI: ${messageParams.uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${authState.nonce}
Issued At: ${issuedAt}`;

      console.log("SIWE Message:", message);
      setAuthState((prev) => ({ ...prev, message }));

      // Sign the message
      const signature = await signMessageAsync({ message });
      console.log("Signature:", signature);

      setAuthState((prev) => ({ ...prev, signature, step: "sending" }));

      // Send data to bot using Telegram Mini App SDK
      const dataToSend = JSON.stringify({
        type: "WALLET_LINK",
        payload: {
          address,
          signature,
        },
      });

      if (sendData.isAvailable()) {
        console.log("Sending data to bot:", dataToSend);
        sendData(dataToSend);
        setAuthState((prev) => ({ ...prev, step: "completed" }));

        // Close mini app after sending data
        setTimeout(() => {
          if (miniApp.close.isAvailable()) {
            miniApp.close();
          }
        }, 2000);
      } else {
        console.error("sendData is not available");
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
      console.error("SIWE flow error:", error);
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
