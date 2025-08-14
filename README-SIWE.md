# SIWE (Sign-In with Ethereum) Integration

이 프로젝트는 Telegram Mini App에서 SIWE 플로우를 구현합니다.

## 구현된 플로우

1. **봇에서 미니앱으로 nonce 전달**: Start params로 nonce 값을 전달
2. **지갑 연결 확인**: 지갑이 연결되지 않았으면 지갑 연결 UI 표시
3. **메시지 파라미터 형성**: 도메인, URI, 체인 ID 등 설정
4. **SIWE 메시지 생성**: 표준 SIWE 포맷으로 메시지 생성
5. **메시지 서명**: AppKit을 통해 지갑에서 서명
6. **데이터 전송**: `sendData` API로 봇에 서명된 데이터 전송

## 메시지 포맷

```
I wants you to sign in with your Ethereum account:
0x1234...5678

Please sign with your account

URI: https://...
Version: 1
Chain ID: 8453
Nonce: randomNonceString
Issued At: 2024-12-20T10:30:00.000Z
```

## 사용 방법

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 설정을 추가하세요:

```env
VITE_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
```

### 봇에서 미니앱 실행

봇에서 미니앱을 시작할 때 nonce를 start parameter로 전달:

```
https://your-mini-app-url.com/auth?startapp=your-nonce-value
```

### 인증 플로우 접근

미니앱에서 `/auth` 경로로 이동하면 SIWE 인증 플로우가 시작됩니다.

## 기술 스택

- **Reown AppKit**: 지갑 연결 및 트랜잭션 처리
- **Wagmi**: Ethereum 상호작용
- **SIWE**: Ethereum 계정 인증
- **Telegram Mini Apps SDK**: 미니앱 통합

## 파일 구조

- `src/config/index.tsx`: Wagmi 및 AppKit 설정
- `src/config/siwe.tsx`: SIWE 설정
- `src/context/index.tsx`: React Context Provider
- `src/pages/AuthPage/AuthPage.tsx`: SIWE 인증 페이지
- `global.d.ts`: TypeScript 타입 정의

## 개발 모드

개발 모드에서는 테스트용 nonce (`test-nonce-12345`)가 자동으로 설정됩니다.

## 프로덕션 배포

1. WalletConnect Cloud에서 Project ID 발급
2. `.env.local`에 Project ID 설정
3. 봇 설정에서 미니앱 URL 등록
4. 봇에서 nonce와 함께 미니앱 실행

## 보안 고려사항

- 현재 구현에서는 클라이언트 사이드에서만 검증합니다
- 프로덕션에서는 서버 사이드에서 서명 검증을 구현해야 합니다
- Nonce는 한 번만 사용되어야 하며, 서버에서 관리되어야 합니다
