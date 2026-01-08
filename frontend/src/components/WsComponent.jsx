import { useEffect, useMemo, useRef, useState } from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import UserList from "./UserList";

export default function WsComponent({ currentUser, onLoginClick, onLogoutClick }) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [typingUser, setTypingUser] = useState("");
    const [recipient, setRecipient] = useState(null);
    const [contacts, setContacts] = useState([]);

    const chatEndRef = useRef(null);
    const ws = useRef(null);
    const currentUserRef = useRef(currentUser);

    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    // 1. Fetch History Function
    async function fetchHistory(beforeTimestamp = null, userId = null) {
        if (isLoading) return;

        setIsLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        try {
            let url = userId 
                ? `${BASE_URL}/api/messages/user/${userId}`
                : `${BASE_URL}/api/messages`;

            if (beforeTimestamp) {
                url += `${url.includes('?') ? '&' : '?'}before=${beforeTimestamp}`;
            }
            
            const res = await fetch(url, { headers });
            const data = await res.json();

            if (data.length < 50) {
                setHasMore(false);
            } else {
                setHasMore(true); 
            }

            if (beforeTimestamp) {
                setMessages(prev => [...data, ...prev]);
            } else {
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. WebSocket Connection
    useEffect(() => {
        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = Stomp.over(socket);
        client.debug = () => { }; 
        ws.current = client;

        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        client.connect(headers, function (frame) {
            client.subscribe('/topic/messages', function (message) {
                const recievedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, recievedMessage]);
            });

            client.subscribe('/user/queue/messages', function (message) {
                const recievedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, recievedMessage]);
                
                if (recievedMessage.user.username !== currentUserRef.current?.username) {
                    addToContacts(recievedMessage.user);
                }
            });

            client.subscribe('/topic/typing', function (message) {
                const username = message.body;
                if (currentUserRef.current && username === currentUserRef.current.username) return;
                setTypingUser(username);
                setTimeout(() => setTypingUser(null), 3000);
            });
        });

        return () => { if (client) client.disconnect(); };
    }, []);

    // 3. Handle Recipient Change (Loads History)
    useEffect(() => {
        setMessages([]);
        setHasMore(true);

        if (recipient) {
            fetchHistory(null, recipient.id);
        } else {
            fetchHistory(null, null);
        }
    }, [recipient]);

    // 4. Contact Persistence
    useEffect(() => {
        if (currentUser) {
            const storageKey = `chat_contacts_${currentUser.username}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) setContacts(JSON.parse(saved));
        } else {
            setContacts([]);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && contacts.length > 0) {
            const storageKey = `chat_contacts_${currentUser.username}`;
            localStorage.setItem(storageKey, JSON.stringify(contacts));
        }
    }, [contacts, currentUser]);

    function addToContacts(user) {
        if (!user || !user.username) return;
        setContacts(prev => {
            const exists = prev.some(u => u.username === user.username);
            if (exists) return prev;
            return [...prev, user];
        });
    }

    // 5. Send Message Logic
    function sendMessage(content) {
        if (!currentUser || !ws.current || !content.trim()) return;

        const msg = {
            username: currentUser.username,
            content: content,
            recipientUsername: recipient ? recipient.username : null
        };

        ws.current.send("/app/chat", {}, JSON.stringify(msg));
    }

    const randomUsername = useMemo(() => {
        const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Angry"];
        const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
        return "Guest_" + adjectives[Math.floor(Math.random() * 5)] + nouns[Math.floor(Math.random() * 5)] + Math.floor(Math.random() * 1000);
    }, []);

    const displayedMessages = messages.filter(msg => {
        if (!currentUser || !msg || !msg.user) return false;

        if (!recipient) {
            return !msg.recipient;
        } else {
            const isMyMsg = (msg.user.username === currentUser.username && 
                            msg.recipient?.username === recipient.username);
            const isTheirMsg = (msg.user.username === recipient.username && 
                               msg.recipient?.username === currentUser.username);
            return isMyMsg || isTheirMsg;
        }
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="bg-surface rounded-lg shadow-xl overflow-hidden flex flex-row w-[900px] h-[600px] border border-surface-muted">

                {currentUser && (
                    <UserList
                        messages={messages}
                        contacts={contacts}
                        selectedUser={recipient}
                        currentUser={currentUser}
                        onSelectUser={(user) => {
                            setRecipient(user);
                            if (user) addToContacts(user);
                        }}
                    />
                )}

                <div className="flex flex-col flex-1 h-full">
                    <ChatHeader
                        currentUser={currentUser}
                        randomUsername={randomUsername}
                        onLoginClick={onLoginClick}
                        onLogoutClick={onLogoutClick}
                        recipient={recipient}
                    />

                    <MessageList
                        messages={displayedMessages} 
                        currentUser={currentUser}
                        chatEndRef={chatEndRef}
                        onLoadMore={() => {
                            const oldestMessageTime = messages[0]?.timestamp;
                            if (oldestMessageTime) {
                                fetchHistory(oldestMessageTime, recipient?.id);
                            }
                        }}
                    />

                    <div className="h-6 px-4 text-xs text-text-muted italic animate-pulse">
                        {typingUser && `${typingUser} is typing...`}
                    </div>

                    <ChatInput
                        onSendMessage={sendMessage}
                        onTyping={() => {
                            if (ws.current?.connected) {
                                ws.current.send("/app/typing", {}, currentUser.username);
                            }
                        }}
                        currentUser={currentUser}
                        onLoginClick={onLoginClick}
                    />
                </div>
            </div>
        </div>
    );
}