import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {chatService} from '@/services/chat.service';
import type {ChatMessage, ChatRouteState, ChatSession} from '@/types/chat';
import {replaceChatRouteState} from '@/types/chat';

type SessionsUpdater = ChatSession[] | ((prev: ChatSession[]) => ChatSession[]);

interface UseChatSessionsOptions {
    userID: string | null;
    initialRouteState: ChatRouteState;
}

function getSelectedSessionID(
    sessions: ChatSession[],
    preferredSessionId?: string,
    fallbackSessionId?: string,
): string {
    if (preferredSessionId && sessions.some((session) => session.id === preferredSessionId)) {
        return preferredSessionId;
    }

    if (fallbackSessionId && sessions.some((session) => session.id === fallbackSessionId)) {
        return fallbackSessionId;
    }

    return sessions[0]?.id ?? '';
}

export function useChatSessions({userID, initialRouteState}: UseChatSessionsOptions) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState(initialRouteState.sessionId ?? '');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [creatingSession, setCreatingSession] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);
    const sessionsRef = useRef<ChatSession[]>([]);
    const activeSessionIdRef = useRef(activeSessionId);

    useEffect(() => {
        activeSessionIdRef.current = activeSessionId;
    }, [activeSessionId]);

    const updateSessions = useCallback((updater: SessionsUpdater) => {
        setSessions((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            sessionsRef.current = next;
            return next;
        });
    }, []);

    const applySessionSelection = useCallback(
        (sessionID: string, sourceSessions: ChatSession[]) => {
            const session = sourceSessions.find((item) => item.id === sessionID) ?? null;

            activeSessionIdRef.current = sessionID;
            setActiveSessionId(sessionID);
            setMessages(session?.messages ?? []);
            replaceChatRouteState({...initialRouteState, sessionId: sessionID || undefined});
        },
        [initialRouteState],
    );

    const loadSessions = useCallback(
        async (preferredSessionId?: string) => {
            if (!userID) {
                updateSessions([]);
                activeSessionIdRef.current = '';
                setActiveSessionId('');
                setMessages([]);
                return;
            }

            setLoadingSessions(true);
            setSessionsError(null);

            try {
                const nextSessions = await chatService.getUserSessions(userID);
                updateSessions(nextSessions);

                const selectedSessionId = getSelectedSessionID(
                    nextSessions,
                    preferredSessionId,
                    activeSessionIdRef.current,
                );

                if (selectedSessionId) {
                    applySessionSelection(selectedSessionId, nextSessions);
                } else {
                    activeSessionIdRef.current = '';
                    setActiveSessionId('');
                    setMessages([]);
                    replaceChatRouteState({...initialRouteState, sessionId: undefined});
                }
            } catch (error) {
                setSessionsError(
                    error instanceof Error ? error.message : 'Не удалось загрузить список чатов',
                );
            } finally {
                setLoadingSessions(false);
            }
        },
        [applySessionSelection, initialRouteState, updateSessions, userID],
    );

    useEffect(() => {
        void loadSessions(initialRouteState.sessionId);
    }, [initialRouteState.sessionId, loadSessions]);

    const selectSession = useCallback(
        (sessionID: string) => {
            applySessionSelection(sessionID, sessionsRef.current);
        },
        [applySessionSelection],
    );

    const createSession = useCallback(async (): Promise<string | null> => {
        if (!userID || creatingSession) {
            return null;
        }

        setCreatingSession(true);
        setSessionsError(null);

        try {
            const sessionID = await chatService.createSession(userID, 'Новый чат');
            const now = new Date().toISOString();
            const nextSession: ChatSession = {
                id: sessionID,
                user_id: userID,
                title: 'Новый чат',
                created_at: now,
                updated_at: now,
                messages: [],
            };
            const nextSessions = [nextSession, ...sessionsRef.current];

            updateSessions(nextSessions);
            applySessionSelection(sessionID, nextSessions);
            return sessionID;
        } catch (error) {
            setSessionsError(error instanceof Error ? error.message : 'Не удалось создать новый чат');
            return null;
        } finally {
            setCreatingSession(false);
        }
    }, [applySessionSelection, creatingSession, updateSessions, userID]);

    const replaceMessages = useCallback(
        (nextMessages: ChatMessage[], targetSessionId = activeSessionId) => {
            setMessages(nextMessages);

            if (!targetSessionId) {
                return;
            }

            updateSessions((prev) =>
                prev.reduce<ChatSession[]>((acc, session) => {
                    if (session.id === targetSessionId) {
                        acc.unshift({
                            ...session,
                            messages: nextMessages,
                            updated_at: new Date().toISOString(),
                        });
                        return acc;
                    }

                    acc.push(session);
                    return acc;
                }, []),
            );
        },
        [activeSessionId, updateSessions],
    );

    const activeSession = useMemo(
        () => sessions.find((session) => session.id === activeSessionId) ?? null,
        [activeSessionId, sessions],
    );

    const latestSessionId = sessions[0]?.id ?? '';

    return {
        sessions,
        activeSessionId,
        activeSession,
        latestSessionId,
        messages,
        loadingSessions,
        creatingSession,
        sessionsError,
        setSessionsError,
        selectSession,
        createSession,
        replaceMessages,
    };
}

export default useChatSessions;




