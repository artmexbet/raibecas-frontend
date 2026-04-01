import type { ChatSession } from '@/types/chat';

export function formatSessionLabel(session: ChatSession): string {
  if (session.title?.trim()) {
    return session.title;
  }

  return `Чат от ${new Date(session.created_at).toLocaleDateString()}`;
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

const chatFormat = {
  formatSessionLabel,
  truncateText,
};

export default chatFormat;


