#!/usr/bin/env python3
"""
텔레그램 봇 예시 - 트랜잭션 전송 미니앱
"""

import json
import base64
import logging
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# 봇 설정
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # BotFather에서 받은 토큰
WEBAPP_URL = "https://leejss.github.io/react-telegram-miniapp-test"  # GitHub Pages URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """봇 시작 명령어"""
    keyboard = [
        [
            KeyboardButton(
                "💰 샘플 트랜잭션 전송",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/send-transaction"),
            )
        ],
        [
            KeyboardButton(
                "🔐 메시지 서명", web_app=WebAppInfo(url=f"{WEBAPP_URL}/sign-message")
            )
        ],
        [
            KeyboardButton(
                "🧪 트랜잭션 테스터",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/transaction-tester"),
            )
        ],
    ]

    reply_markup = ReplyKeyboardMarkup(
        keyboard, resize_keyboard=True, one_time_keyboard=False
    )

    await update.message.reply_text(
        "🤖 Web3 미니앱 봇에 오신 것을 환영합니다!\n\n"
        "아래 버튼을 클릭하여 기능을 사용해보세요:",
        reply_markup=reply_markup,
    )


async def send_custom_transaction(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """커스텀 트랜잭션 전송"""
    # 샘플 트랜잭션 데이터
    tx_data = {
        "to": "0x742d35Cc6537C0532925a3b8C17Eb02b80D4E4AE",
        "value": "0.005",
        "description": "커스텀 트랜잭션 - 0.005 ETH 전송",
        "chainId": 1,
    }

    # JSON을 base64로 인코딩
    json_data = json.dumps(tx_data)
    encoded_data = base64.b64encode(json_data.encode()).decode()

    # 미니앱 URL에 데이터 추가
    webapp_url = f"{WEBAPP_URL}/send-transaction?startapp={encoded_data}"

    keyboard = [
        [KeyboardButton("💸 트랜잭션 실행", web_app=WebAppInfo(url=webapp_url))]
    ]

    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await update.message.reply_text(
        f"🔗 커스텀 트랜잭션 준비완료!\n\n"
        f"📝 받는 주소: {tx_data['to']}\n"
        f"💰 금액: {tx_data['value']} ETH\n"
        f"📄 설명: {tx_data['description']}\n\n"
        f"아래 버튼을 클릭하여 트랜잭션을 실행하세요:",
        reply_markup=reply_markup,
    )


async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """미니앱에서 전달된 데이터 처리"""
    try:
        # 미니앱에서 전달된 JSON 데이터 파싱
        web_app_data = json.loads(update.effective_message.web_app_data.data)

        action = web_app_data.get("action")

        if action == "signMessage":
            # 메시지 서명 결과
            await update.message.reply_text(
                f"✅ 메시지 서명 완료!\n\n"
                f"📝 메시지: {web_app_data.get('message')}\n"
                f"🔐 서명: {web_app_data.get('signature', '')[:20]}...\n"
                f"⏰ 시간: {web_app_data.get('timestamp')}"
            )

        elif action == "transaction_sent":
            # 트랜잭션 전송됨
            await update.message.reply_text(
                f"📤 트랜잭션 전송됨!\n\n"
                f"🔗 해시: {web_app_data.get('txHash')}\n"
                f"📊 상태: {web_app_data.get('status')}\n"
                f"⏰ 시간: {web_app_data.get('timestamp')}\n\n"
                f"⏳ 블록체인 확인을 기다리고 있습니다..."
            )

        elif action == "transaction_confirmed":
            # 트랜잭션 확인됨
            await update.message.reply_text(
                f"🎉 트랜잭션 확인 완료!\n\n"
                f"🔗 해시: {web_app_data.get('txHash')}\n"
                f"📊 최종 상태: {web_app_data.get('status')}\n"
                f"⏰ 완료 시간: {web_app_data.get('timestamp')}\n\n"
                f"✅ 트랜잭션이 성공적으로 완료되었습니다!"
            )

        elif action == "transaction_failed":
            # 트랜잭션 실패
            await update.message.reply_text(
                f"❌ 트랜잭션 실패!\n\n"
                f"🚫 오류: {web_app_data.get('error')}\n"
                f"⏰ 시간: {web_app_data.get('timestamp')}\n\n"
                f"다시 시도해보세요."
            )

        else:
            await update.message.reply_text(
                f"📨 미니앱에서 데이터를 받았습니다:\n\n"
                f"```json\n{json.dumps(web_app_data, indent=2, ensure_ascii=False)}\n```",
                parse_mode="MarkdownV2",
            )

    except Exception as e:
        logger.error(f"Error processing webapp data: {e}")
        await update.message.reply_text(
            f"❌ 데이터 처리 중 오류가 발생했습니다: {str(e)}"
        )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """도움말"""
    help_text = """
🤖 Web3 미니앱 봇 사용법

📋 **사용 가능한 명령어:**
• /start - 봇 시작 및 메인 메뉴
• /custom - 커스텀 트랜잭션 전송
• /help - 도움말

🔧 **기능:**
• 💰 트랜잭션 전송 - 이더리움 트랜잭션 실행
• 🔐 메시지 서명 - 디지털 서명 생성
• 🧪 트랜잭션 테스터 - 테스트용 데이터 생성

💡 **사용 방법:**
1. 아래 키보드 버튼을 클릭
2. 지갑 연결 (MetaMask 등)
3. 트랜잭션 확인 및 실행
4. 결과가 자동으로 봇에 전달됨
"""
    await update.message.reply_text(help_text)


def main():
    """봇 실행"""
    # Application 생성
    application = Application.builder().token(BOT_TOKEN).build()

    # 핸들러 등록
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("custom", send_custom_transaction))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(
        MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data)
    )

    # 봇 실행
    logger.info("봇을 시작합니다...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
