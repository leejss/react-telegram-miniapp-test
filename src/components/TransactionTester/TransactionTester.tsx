"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { useState } from "react";

interface TransactionData {
  to: string;
  value: string;
  data?: string;
  chainId?: number;
  description?: string;
}

export function TransactionTester() {
  const [sampleData, setSampleData] = useState<TransactionData>({
    to: "0x742d35Cc6537C0532925a3b8C17Eb02b80D4E4AE",
    value: "0.001",
    description: "테스트 트랜잭션 - 0.001 ETH 전송",
    chainId: 1,
  });

  const generateBotUrl = () => {
    // 데이터를 JSON으로 변환하고 base64 인코딩
    const jsonData = JSON.stringify(sampleData);
    const encodedData = btoa(jsonData);

    // 현재 도메인을 사용하여 미니앱 URL 생성
    const currentDomain = window.location.origin;
    const miniAppUrl = `${currentDomain}/send-transaction`;

    // 텔레그램 봇 URL 생성 (실제 봇 username으로 교체 필요)
    const botUrl = `https://t.me/your_bot_username?start=${encodedData}`;

    return { botUrl, miniAppUrl, encodedData, jsonData };
  };

  const handleCopyBotUrl = () => {
    const { botUrl } = generateBotUrl();
    navigator.clipboard.writeText(botUrl);
    alert("봇 URL이 클립보드에 복사되었습니다!");
  };

  const handleUpdateField = (field: keyof TransactionData, value: string) => {
    setSampleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const { botUrl, miniAppUrl, encodedData, jsonData } = generateBotUrl();

  return (
    <div style={{ padding: "20px" }}>
      <h2>트랜잭션 테스터</h2>
      <p>봇에서 전달할 트랜잭션 데이터를 설정하고 테스트하세요.</p>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>트랜잭션 데이터 설정</h3>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>받는 주소:</strong>
          </label>
          <input
            type="text"
            value={sampleData.to}
            onChange={(e) => handleUpdateField("to", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "12px",
            }}
            placeholder="0x..."
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>송금액 (ETH):</strong>
          </label>
          <input
            type="text"
            value={sampleData.value}
            onChange={(e) => handleUpdateField("value", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="0.001"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>설명:</strong>
          </label>
          <input
            type="text"
            value={sampleData.description || ""}
            onChange={(e) => handleUpdateField("description", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="트랜잭션 설명"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>Chain ID:</strong>
          </label>
          <input
            type="number"
            value={sampleData.chainId || ""}
            onChange={(e) => handleUpdateField("chainId", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="1"
          />
        </div>
      </div>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          background: "#e8f5e8",
          borderRadius: "8px",
        }}
      >
        <h3>생성된 데이터</h3>

        <div style={{ marginBottom: "15px" }}>
          <strong>JSON 데이터:</strong>
          <pre
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
            }}
          >
            {jsonData}
          </pre>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>Base64 인코딩:</strong>
          <pre
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            {encodedData}
          </pre>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>미니앱 URL:</strong>
          <pre
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
            }}
          >
            {miniAppUrl}
          </pre>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong>봇 URL (예시):</strong>
          <pre
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            {botUrl}
          </pre>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <Button onClick={handleCopyBotUrl} size="l">
          봇 URL 복사
        </Button>
      </div>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          background: "#fff3cd",
          borderRadius: "8px",
        }}
      >
        <h3>사용 방법</h3>
        <ol style={{ textAlign: "left", paddingLeft: "20px" }}>
          <li>위의 트랜잭션 데이터를 원하는 대로 수정하세요.</li>
          <li>"봇 URL 복사" 버튼을 클릭하여 URL을 복사하세요.</li>
          <li>텔레그램 봇에서 이 URL을 키보드 버튼으로 설정하세요.</li>
          <li>
            또는 현재 페이지 URL에 `?start={encodedData}`를 추가하여 직접
            테스트하세요.
          </li>
        </ol>
      </div>
    </div>
  );
}
