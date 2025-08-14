"use client";

import {
  retrieveLaunchParams,
  sendData,
  popup,
} from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import { useState, useEffect } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

interface TransactionData {
  to: string;
  value: string; // ETH 단위
  data?: string;
  chainId?: number;
  description?: string;
}

export function SendTransaction() {
  const { isConnected } = useAccount();
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 트랜잭션 영수증 대기
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  useEffect(() => {
    // 봇에서 전달된 시작 파라미터 확인
    const launchParams = retrieveLaunchParams();
    console.log("📱 Launch params:", launchParams);
    console.log("🔍 Start param:", launchParams.tgWebAppStartParam);

    // 시작 파라미터에서 트랜잭션 데이터 파싱
    if (launchParams.tgWebAppStartParam) {
      try {
        // startParam은 base64 인코딩된 JSON일 수 있음
        let jsonData = launchParams.tgWebAppStartParam;

        // base64 디코딩 시도
        try {
          jsonData = atob(launchParams.tgWebAppStartParam);
          console.log("📦 Decoded from base64:", jsonData);
        } catch {
          console.log("📦 Using raw start param:", jsonData);
        }

        const txData: TransactionData = JSON.parse(jsonData);
        console.log("✅ Parsed transaction data:", txData);
        setTransactionData(txData);
      } catch (error) {
        console.error("❌ Failed to parse transaction data:", error);
        popup.show({
          title: "데이터 파싱 오류",
          message: "봇에서 전달된 트랜잭션 데이터를 해석할 수 없습니다.",
          buttons: [{ id: "ok", type: "default", text: "확인" }],
        });
      }
    }
  }, []);

  const handleSendTransaction = async () => {
    if (!transactionData || !isConnected) return;

    try {
      setIsProcessing(true);
      console.log("🚀 Sending transaction...");

      const hash = await sendTransactionAsync({
        to: transactionData.to as `0x${string}`,
        value: parseEther(transactionData.value),
        data: transactionData.data as `0x${string}` | undefined,
      });

      console.log("✅ Transaction sent:", hash);
      setTxHash(hash);

      // 트랜잭션 해시를 즉시 텔레그램에 전달
      const resultData = {
        action: "transaction_sent",
        txHash: hash,
        timestamp: new Date().toISOString(),
        status: "pending",
        transactionData: transactionData,
      };

      if (sendData.isAvailable()) {
        console.log("📤 Sending transaction hash to Telegram...");
        sendData(JSON.stringify(resultData));
        console.log("✅ Transaction hash sent to Telegram");
      } else {
        console.log("❌ sendData not available");
      }
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      setIsProcessing(false);

      // 에러를 텔레그램에 전달
      const errorData = {
        action: "transaction_failed",
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
        transactionData: transactionData,
      };

      if (sendData.isAvailable()) {
        sendData(JSON.stringify(errorData));
      }

      popup.show({
        title: "트랜잭션 실패",
        message: `트랜잭션 전송에 실패했습니다: ${error.message}`,
        buttons: [{ id: "ok", type: "default", text: "확인" }],
      });
    }
  };

  // 트랜잭션 확인 완료 시 최종 결과 전달
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("🎉 Transaction confirmed!");

      const finalResultData = {
        action: "transaction_confirmed",
        txHash: txHash,
        timestamp: new Date().toISOString(),
        status: "confirmed",
        transactionData: transactionData,
      };

      if (sendData.isAvailable()) {
        console.log("📤 Sending final confirmation to Telegram...");
        sendData(JSON.stringify(finalResultData));
        console.log("✅ Final confirmation sent to Telegram");
      }

      popup.show({
        title: "트랜잭션 완료",
        message: "트랜잭션이 성공적으로 완료되었습니다!",
        buttons: [{ id: "ok", type: "default", text: "확인" }],
      });

      setIsProcessing(false);
    }
  }, [isConfirmed, txHash, transactionData]);

  if (!isConnected) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>트랜잭션 전송</h2>
        <p>지갑을 먼저 연결해주세요.</p>
        <appkit-button />
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>트랜잭션 전송</h2>
        <p>봇에서 전달된 트랜잭션 데이터가 없습니다.</p>
        <p>봇의 키보드 버튼을 통해 접속해주세요.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>트랜잭션 전송</h2>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "8px",
          textAlign: "left",
        }}
      >
        <h3>트랜잭션 정보</h3>
        {transactionData.description && (
          <p>
            <strong>설명:</strong> {transactionData.description}
          </p>
        )}
        <p>
          <strong>받는 주소:</strong> {transactionData.to}
        </p>
        <p>
          <strong>송금액:</strong> {transactionData.value} ETH
        </p>
        {transactionData.data && (
          <p>
            <strong>데이터:</strong> {transactionData.data.slice(0, 20)}...
          </p>
        )}
      </div>

      <Button
        onClick={handleSendTransaction}
        disabled={isSending || isProcessing || isConfirming}
        size="l"
        style={{ margin: "10px 0", minWidth: "200px" }}
      >
        {isSending || isProcessing
          ? "전송 중..."
          : isConfirming
          ? "확인 중..."
          : "트랜잭션 전송"}
      </Button>

      {txHash && (
        <div style={{ marginTop: "20px" }}>
          <h3>트랜잭션 상태</h3>
          <p
            style={{
              fontSize: "12px",
              wordBreak: "break-all",
              background: "#e8f5e8",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <strong>해시:</strong> {txHash}
          </p>
          <p style={{ color: isConfirmed ? "green" : "orange" }}>
            {isConfirming
              ? "⏳ 블록체인 확인 중..."
              : isConfirmed
              ? "✅ 트랜잭션 완료!"
              : "📤 트랜잭션 전송됨"}
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
