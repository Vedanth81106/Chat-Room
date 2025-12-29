import { useEffect, useRef } from "react";

function formatTime(timestamp) {
    if (!timestamp) return "";

    let timeString = timestamp;
    if (!timestamp.endsWith("Z")) {
        timeString = timestamp + "Z";
    }

    const date = new Date(timeString);
    
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

export default function MessageList({ messages, currentUser, chatEndRef }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface scrollbar-thin scrollbar-thumb-surface-muted">
            {messages.length === 0 && (
                <div className="text-center text-text-muted mt-10">
                    <p>No messages yet.</p>
                    <p className="text-sm">Be the first to say hello!</p>
                </div>
            )}

            {messages.map((msg, index) => {
                const isMe = currentUser && msg.user && (msg.user.username === currentUser.username);
                const senderName = msg.user ? msg.user.username : "Unknown";

                return (
                    <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-text-muted mb-1 px-1">
                            {isMe ? "You" : senderName}
                        </span>
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words whitespace-pre-wrap ${
                            isMe 
                            ? "bg-accent text-white rounded-tr-none" 
                            : "bg-surface-muted text-text-primary border border-surface-muted rounded-tl-none"
                        }`}>
                            {msg.content}
                            <div className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                {formatTime(msg.timestamp)}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={chatEndRef} />
        </div>
    );
}