import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '@/services/chat.service';
import { tokenManager } from '@/services/tokenManager';

export interface StreamChunk {
  done: boolean;
  message?: { role: string; content: string };
  error?: string;
  type?: string;
}

export function useChatWebSocket(userID: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const connect = useCallback(() => {
    if (!userID) {
      return;
    }

    wsRef.current?.close();

    const accessToken = tokenManager.getAccessToken();
    const ws = new WebSocket(chatService.buildWebSocketURL(userID, accessToken));
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };
    ws.onerror = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };
  }, [userID]);

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (input: string, onChunk: (chunk: StreamChunk) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error('Чат пока не подключён к серверу'));
          return;
        }

        setIsStreaming(true);
        let settled = false;

        const cleanup = () => {
          ws.removeEventListener('message', handleMessage);
          ws.removeEventListener('close', handleClose);
          ws.removeEventListener('error', handleError);
        };

        const finishWithError = (error: Error) => {
          if (settled) {
            return;
          }

          settled = true;
          cleanup();
          setIsStreaming(false);
          reject(error);
        };

        const handleMessage = (event: MessageEvent) => {
          try {
            const chunk: StreamChunk = JSON.parse(String(event.data));

            if (chunk.error || chunk.type === 'error') {
              finishWithError(new Error(chunk.error ?? 'Сервер чата вернул ошибку'));
              return;
            }

            onChunk(chunk);

            if (chunk.done && !settled) {
              settled = true;
              cleanup();
              setIsStreaming(false);
              resolve();
            }
          } catch {
            // ignore invalid chunks
          }
        };

        const handleClose = () => finishWithError(new Error('Соединение с чатом было закрыто'));
        const handleError = () => finishWithError(new Error('Ошибка соединения с чатом'));

        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', handleClose);
        ws.addEventListener('error', handleError);

        ws.send(JSON.stringify({ user_id: userID, input }));
      });
    },
    [userID],
  );

  return {
    isConnected,
    isStreaming,
    sendMessage,
    reconnect: connect,
  };
}

export default useChatWebSocket;


