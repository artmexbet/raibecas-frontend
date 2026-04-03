import { Typography, theme } from 'antd';
import chatLogo from '@/static/chat_log.svg';

const { Title } = Typography;

export function ChatEmptyState() {
  const { token } = theme.useToken();

  return (
    <div className="chat-page__welcome">
      <img src={chatLogo} alt="Райбекас цифровой" className="chat-page__welcome-logo" />

      <Title
        level={1}
        className="chat-page__welcome-title"
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 500,
          lineHeight: 1.15,
          color: token.colorText,
        }}
      >
        С чего начнём поиск сегодня?
      </Title>
    </div>
  );
}



