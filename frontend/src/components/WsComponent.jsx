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
    const [isSearching, setIsSearching] = useState(false);

    const chatEndRef = useRef(null);
    const ws = useRef(null);
    const currentUserRef = useRef(currentUser);

    // keeps the ref updated with current user for websocket callbacks
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    // helper function to clean up the token (removes extra quotes)
    function getToken() {
        const raw = localStorage.getItem("token");
        return raw ? raw.replace(/^"|"$/g, '') : null;
    }

    // 1. fetch history function
    async function fetchHistory(beforeTimestamp = null, userId = null) {
        if (isLoading) return;

        setIsLoading(true);
        const token = getToken();
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        try {
            let url = userId 
                ? `${BASE_URL}/api/messages/user/${userId}`
                : `${BASE_URL}/api/messages`;

            // adds timestamp param if scrolling up, encodes it to handle spaces
            if (beforeTimestamp) {
                url += `${url.includes('?') ? '&' : '?'}before=${encodeURIComponent(beforeTimestamp)}`;
            }
            
            const res = await fetch(url, { headers });
            
            // stops execution if permission denied or error occurs
            if (!res.ok) {
                console.warn(`Failed to fetch history. Status: ${res.status}`);
                setIsLoading(false);
                return;
            }

            const data = await res.json();

            // determines if there are more messages to load
            if (data.length < 50) setHasMore(false);
            else setHasMore(true); 

            // prepends old messages or sets initial load
            if (beforeTimestamp) setMessages(prev => [...data, ...prev]);
            else setMessages(data);
            
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. websocket connection
    useEffect(() => {
        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = Stomp.over(socket);
        client.debug = () => { }; 
        ws.current = client;

        const token = getToken();
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        client.connect(headers, function (frame) {
            
            // subscribes to global messages
            client.subscribe('/topic/messages', function (message) {
                const recievedMessage = JSON.parse(message.body);
                setMessages(prev => {
                    // ignores live updates if user is currently searching
                    if (isSearching) return prev; 
                    return [...prev, recievedMessage];
                });
            });

            // subscribes to private messages
            client.subscribe('/user/queue/messages', function (message) {
                const recievedMessage = JSON.parse(message.body);
                setMessages(prev => {
                    if (isSearching) return prev;
                    return [...prev, recievedMessage];
                });
                
                // adds sender to contacts list if it's a new person
                if (recievedMessage.user.username !== currentUserRef.current?.username) {
                    addToContacts(recievedMessage.user);
                }
            });

            // subscribes to typing indicators
            client.subscribe('/topic/typing', function (message) {
                const username = message.body;
                if (currentUserRef.current && username === currentUserRef.current.username) return;
                setTypingUser(username);
                setTimeout(() => setTypingUser(null), 3000);
            });
        });

        return () => { if (client) client.disconnect(); };
    }, [isSearching]); // reconnects if search state changes to ensure correct logic

    // 3. handle recipient change
    useEffect(() => {
        // only fetches history if not in search mode
        if (!isSearching) {
            setMessages([]);
            setHasMore(true);
            if (recipient) fetchHistory(null, recipient.id);
            else fetchHistory(null, null);
        }
    }, [recipient]);

    // 4. contact persistence
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

    // 5. send message logic
    function sendMessage(content) {
        if (!currentUser || !ws.current || !content.trim()) return;

        const msg = {
            username: currentUser.username,
            content: content,
            recipientUsername: recipient ? recipient.username : null
        };
        ws.current.send("/app/chat", {}, JSON.stringify(msg));
    }

    // 6. search function
    async function handleSearch(query){
        if(!query.trim()) return;

        setIsLoading(true);
        setIsSearching(true);
        setHasMore(false); // disables scrolling up while searching

        try{
            const token = getToken();
            const headers = token ? {"Authorization": `Bearer ${token}` } : {};

            let url = `${BASE_URL}/api/messages/search?content=${encodeURIComponent(query)}`;
            if(recipient){
                url += `&recipientId=${recipient.id}`;
            }
            const res = await fetch(url, {headers});
            const data = await res.json();
            setMessages(data);
        }catch(err){
            console.error("Search failed", err);
        }finally{
            setIsLoading(false);
        }
    }

    // exits search mode and reloads normal history
    function exitSearch(){
        setIsSearching(false);
        setMessages([]);
        if(recipient) fetchHistory(null, recipient.id);
        else fetchHistory(null,null);
    }

    // generates a random name for guests
    const randomUsername = useMemo(() => {
        const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Angry"];
        const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
        return "Guest_" + adjectives[Math.floor(Math.random() * 5)] + nouns[Math.floor(Math.random() * 5)] + Math.floor(Math.random() * 1000);
    }, []);

    // filters messages to only show relevant ones (global vs private)
    const displayedMessages = messages.filter(msg => {
        if (isSearching) return true; // shows all results during search
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
                            setIsSearching(false);
                            setMessages([]);
                            setRecipient(user);
                            if(user) addToContacts(user);
        
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
                        isSearching={isSearching}
                        onToggleSearch={(isOpen) => {
                            if(!isOpen) exitSearch();
                            else setIsSearching(true);
                        }}
                        onSearchSubmit={handleSearch}
                    />

                    {isSearching && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1">
                            Search Results
                        </div>
                    )}

                    <MessageList
                        messages={displayedMessages} 
                        currentUser={currentUser}
                        chatEndRef={chatEndRef}
                        onLoadMore={() => {
                            // only loads more history if we are not searching
                            if (!isSearching) {
                                const oldestMessageTime = messages[0]?.timestamp;
                                if (oldestMessageTime) {
                                    fetchHistory(oldestMessageTime, recipient?.id);
                                }
                            }
                        }}
                    />

                    <div className="h-6 px-4 text-xs text-text-muted italic animate-pulse">
                        {typingUser && `${typingUser} is typing...`}
                    </div>

                    {isSearching ? (
                        <div className="p-4 text-center text-gray-500 border-t">
                            Close search to continue chatting
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}