import { useEffect, useMemo, useRef, useState } from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function WsComponent({currentUser, onLoginClick, onLogoutClick}) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const randomUsername = useMemo(() => {
        const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Angry"];
        const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return "Guest_" + adjective + noun + Math.floor(Math.random() * 1000);
    }, []);

    const currentUserRef = useRef(currentUser);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typingUser, setTypingUser] = useState("");
    
    const chatEndRef = useRef(null);
    const ws = useRef(null);

    // --- WebSocket Logic ---
    useEffect(() => {
        const fetchHistory = async() => {
            const token = localStorage.getItem("token");
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};
            const res = await fetch(`${BASE_URL}/api/messages`, { headers });
            const data = await res.json();
            setMessages(data);
        };
        fetchHistory();
        
        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = Stomp.over(socket);
        client.debug = () => {}; 
        ws.current = client;

        client.connect({}, function(frame) {
            client.subscribe('/topic/messages', function(message) {
                const recievedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, recievedMessage]);
            });

            client.subscribe('/topic/typing', function(message){
                const username = message.body;
                if(currentUserRef.current && username === currentUserRef.current.username) return;
                setTypingUser(username);
                setTimeout(() => setTypingUser(null), 3000);
            });
        });

        return () => { if (client) client.disconnect(); };
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Actions ---
    function sendMessage(e) {
        if (e) e.preventDefault();
        if(!currentUser || !ws.current || !input.trim()) return;

        const msg = { username: currentUser.username, content: input };
        ws.current.send("/app/chat", {}, JSON.stringify(msg));
        setInput("");
    }

    function handleTyping(){
        if(ws.current?.connected && currentUser){
            ws.current.send("/app/typing", {}, currentUser.username);
        }
    }

    // --- Render ---
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="bg-surface rounded-lg shadow-xl overflow-hidden flex flex-col w-[900px] h-[600px] border border-surface-muted">
                
                <ChatHeader 
                    currentUser={currentUser} 
                    randomUsername={randomUsername} 
                    onLoginClick={onLoginClick} 
                    onLogoutClick={onLogoutClick} 
                />

                <MessageList 
                    messages={messages} 
                    currentUser={currentUser} 
                    chatEndRef={chatEndRef} 
                />
                
                {/* Typing Indicator */}
                <div className="h-6 px-4 text-xs text-text-muted italic animate-pulse">
                    {typingUser && `${typingUser} is typing...`}
                </div>

                <ChatInput 
                    input={input} 
                    setInput={setInput} 
                    sendMessage={sendMessage} 
                    handleTyping={handleTyping} 
                    currentUser={currentUser} 
                    onLoginClick={onLoginClick}
                />
            </div>
        </div>
    );
}