    import { useEffect, useMemo, useRef, useState } from "react";
    import SockJS from 'sockjs-client';
    import Stomp from 'stompjs';

    export default function WsComponent({currentUser, onLoginClick, onLogoutClick}) {

        //usememo creates a random username once and caches it so as to prevet a new username on every re render
        const randomUsername = useMemo(() => {
            const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Angry"];
            const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
            const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            return "Guest_" + adjective + noun + Math.floor(Math.random() * 1000);
        }, []);

        const [messages, setMessages] = useState([]);
        const [input, setInput] = useState("");
        
        const chatEndRef = useRef(null);
        const ws = useRef(null);

        useEffect(() => {

            const fetchHistory = async() => {
                const token = localStorage.getItem("token");
                const headers = {};
                if(token) headers["Authorization"] = `Bearer ${token}`
                const res = await fetch("http://localhost:8080/api/messages", { headers });
                const data = await res.json();
                setMessages(data);
                };
            fetchHistory();
            
            const socket = new SockJS('http://localhost:8080/ws');//creates a sockJS connection to the backend server's /ws endpoint
            const client = Stomp.over(socket);//create a STOMP connection on top of socksJS
            client.debug = () => {}; // Disable debug logs for cleaner console
            ws.current = client;//store the client in the ref to use it later in sendMessage() fn

            //connect to Stomp server, {} = connection headers(not needed here),
            // function(frame) = callback fn that runs when connection succeeds
                console.log("Connected to Chat");
            client.connect({}, function(frame) {
                //whenever a message is published to this topic(messages), callback function runs
                client.subscribe('/topic/messages', function(message) {
                    const recievedMessage = JSON.parse(message.body);
                    setMessages(prevMessages => [...prevMessages, recievedMessage]);
                });
            });

            return () => {
                if (client) client.disconnect();//runs when component unmounts
            };
        }, []);

        // Auto-scroll to bottom whenever messages change
        useEffect(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [messages]);

        function sendMessage(e) {
            if (e) e.preventDefault();

            if(!currentUser) return; //guests cannot send messages

            if (ws.current && input.trim() && ws.current.connected !== "") {//check if ws is connected and if user types some msg
                const msg = {
                    username: currentUser.username,
                    content: input
                };
                //send mesg to server. /app/chat is the destination, {} = headers(empty here),
                // Json... converts js object to json object
                ws.current.send("/app/chat", {}, JSON.stringify(msg));
                setInput("");//clear input field after sending
            }else{
                console.log("Chat not connected yet!")
            }
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                
                {/* main chat container */}
                <div className="bg-surface rounded-lg shadow-xl overflow-hidden flex flex-col w-[900px] h-[600px] border border-surface-muted">
                    
                    {/*part where it shows username*/}
                    <div className="bg-surface p-4 text-text-primary flex justify-between items-center border-b border-surface-muted z-10">
                        <div>
                            <h2 className="text-xl font-bold">Chat Room</h2>
                            <p className="text-text-muted text-sm">
                                {currentUser 
                                    ? `Logged in as: ${currentUser.username}` 
                                    : `Browsing as: ${randomUsername}`}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* statsu circle */}
                            <div className="h-3 w-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            
                            {/* login/logout buton */}
                            {currentUser ? (
                                <button 
                                    onClick={onLogoutClick} 
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button 
                                    onClick={onLoginClick} 
                                    className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent-hover transition-colors shadow-lg"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>

                    {/* messages container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface scrollbar-thin scrollbar-thumb-surface-muted">
                        {messages.length === 0 && (
                            <div className="text-center text-text-muted mt-10">
                                <p>No messages yet.</p>
                                <p className="text-sm">Be the first to say hello!</p>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            // check if msg belongs to current user
                            // check is msg sneder username is same as loggedin user
                            const isMe = currentUser && msg.user && (msg.user.username === currentUser.username);
                            
                            // Fallback for username display
                            const senderName = msg.user ? msg.user.username : "Unknown";

                            return (
                                <div 
                                    key={index} 
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                    <span className="text-xs text-text-muted mb-1 px-1">
                                        {isMe ? "You" : senderName}
                                    </span>
                                    <div 
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${
                                            isMe 
                                            ? "bg-accent text-white rounded-tr-none" 
                                            : "bg-surface-muted text-text-primary border border-surface-muted rounded-tl-none"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Invisible element to auto-scroll to */}
                        <div ref={chatEndRef} />
                    </div>

                    {/* input area */}
                    <div className="p-4 bg-surface border-t border-surface-muted">
                        {currentUser ? (
                            // if logged in, show input form
                            <form 
                                onSubmit={sendMessage}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-3 bg-surface text-text-primary border border-surface-muted rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim()}
                                    className="bg-accent text-white p-3 rounded-full hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </button>
                            </form>
                        ) : (
                            // if guest
                            <div className="flex items-center justify-center p-3 bg-surface-muted rounded-full border border-surface-muted opacity-80 cursor-not-allowed">
                                <p className="text-text-muted text-sm">
                                    <button 
                                        onClick={onLoginClick} 
                                        className="text-accent font-bold hover:underline cursor-pointer"
                                    >
                                        Login
                                    </button>
                                    {" "} to join the conversation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

    }