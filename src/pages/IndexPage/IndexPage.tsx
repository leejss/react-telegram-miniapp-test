import { Cell, List, Section } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section
          header="Web3 Authentication"
          footer="SIWE (Sign-In with Ethereum) integration for Telegram Mini Apps"
        >
          <Link to="/auth">
            <Cell subtitle="Connect wallet and sign with Ethereum account">
              🔐 SIWE Authentication
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link to="/init-data">
            <Cell subtitle="User data, chat information, technical data">
              Init Data
            </Cell>
          </Link>
          <Link to="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">
              Launch Parameters
            </Cell>
          </Link>
          <Link to="/theme-params">
            <Cell subtitle="Telegram application palette information">
              Theme Parameters
            </Cell>
          </Link>
        </Section>
        <Section
          header="Web3 Features"
          footer="Ethereum wallet integration examples"
        >
          <Link to="/sign-message">
            <Cell subtitle="Sign arbitrary messages with connected wallet">
              ✍️ Sign Message
            </Cell>
          </Link>
          <Link to="/send-transaction">
            <Cell subtitle="Send Ethereum transactions">
              💸 Send Transaction
            </Cell>
          </Link>
        </Section>
      </List>
    </Page>
  );
};
