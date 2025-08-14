"use client";

import { retrieveLaunchParams, sendData } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function SignMessage() {
  const { isConnected } = useAccount();
  const {
    signMessageAsync,
    data: signature,
    error,
    isPending,
  } = useSignMessage();
  const [isSigningComplete, setIsSigningComplete] = useState(false);

  const handleSignMessage = async () => {
    try {
      setIsSigningComplete(false);

      const message = "Hello World";
      const result = await signMessageAsync({ message });

      // 서명 결과가 반환된 후 텔레그램에 전달
      if (result) {
        setIsSigningComplete(true);

        // 텔레그램에 결과 전달
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          console.log("🚀 Telegram WebApp detected, preparing to send data...");

          const launchParams = retrieveLaunchParams();
          console.log("📱 Launch params:", launchParams);

          const signatureData = {
            action: "signMessage",
            message: message,
            signature: result,
            timestamp: new Date().toISOString(),
            userId:
              (launchParams.tgWebAppInitData as any).user?.id || "unknown",
          };

          console.log("📦 Data to send:", signatureData);
          console.log(
            "📏 Data size:",
            JSON.stringify(signatureData).length,
            "bytes",
          );

          // 텔레그램 WebApp에 서명 결과 전달
          try {
            console.log("📤 Calling sendData...");

            // Method 1: Using SDK sendData function
            if (sendData.isAvailable()) {
              console.log("🎯 Using SDK sendData method");
              sendData(JSON.stringify(signatureData));
              console.log("✅ SDK sendData called successfully!");
            } else {
              console.log("🔄 Fallback to window.Telegram.WebApp.sendData");
              window.Telegram.WebApp.sendData(JSON.stringify(signatureData));
              console.log("✅ Direct sendData called successfully!");
            }

            console.log("📋 Sent data:", JSON.stringify(signatureData));
          } catch (sendError) {
            console.error("❌ Failed to send data to Telegram:", sendError);
          }

          // 성공 알림 표시
          window.Telegram.WebApp.showAlert(
            "메시지 서명이 완료되어 텔레그램에 전달되었습니다!",
          );
        } else {
          console.log("Telegram WebApp not available, signature:", result);
        }
      }
    } catch (err) {
      console.error("Sign message error:", err);

      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert("서명 중 오류가 발생했습니다.");
      }
    }
  };

  if (!isConnected) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>지갑을 먼저 연결해주세요.</p>
        <appkit-button />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>메시지 서명</h2>

      <div style={{ margin: "20px 0" }}>
        <p>
          서명할 메시지: <strong>"Hello World"</strong>
        </p>
      </div>

      <Button
        onClick={handleSignMessage}
        disabled={isPending}
        size="l"
        style={{ margin: "10px 0" }}
      >
        {isPending ? "서명 중..." : "Sign Message"}
      </Button>

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <p>Error: {error.message}</p>
        </div>
      )}

      {signature && isSigningComplete && (
        <div style={{ marginTop: "20px" }}>
          <h3>서명 완료!</h3>
          <p
            style={{
              fontSize: "12px",
              wordBreak: "break-all",
              background: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            Signature: {signature}
          </p>
          <p style={{ color: "green", marginTop: "10px" }}>
            ✅ 서명 결과가 텔레그램에 전달되었습니다!
          </p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>연결된 지갑</h3>
        <appkit-button />
      </div>
    </div>
  );
}

// 전역 Telegram 타입 선언
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        sendData: (data: string) => void;
        showAlert: (message: string) => void;
      };
    };
  }
}
