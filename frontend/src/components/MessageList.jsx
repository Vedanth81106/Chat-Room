import { useLayoutEffect, useRef } from "react";

function formatTime(timestamp) {
    if (!timestamp) return "";

    // If not in UTC (Z), convert it so we can format safely
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

export default function MessageList({ messages, currentUser, chatEndRef, onLoadMore }) {

    const scrollContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(null);

    function handleScroll(){
        const container = scrollContainerRef.current;
        if(!container) return;

        // Trigger load ONLY if at top AND we have messages
        if(container.scrollTop === 0 && messages.length > 0){
            prevScrollHeightRef.current = container.scrollHeight;
            
            if(onLoadMore) onLoadMore();
        }
    }

    // Smart Scroll Logic: Runs before paint
    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if(!container) return;

        // Scenario A: We loaded OLD messages (maintain position)
        if(prevScrollHeightRef.current){
            const newScrollHeight = container.scrollHeight;
            const heightDifference = newScrollHeight - prevScrollHeightRef.current;

            container.scrollTop = heightDifference;
            prevScrollHeightRef.current = null;
        } 
        // Scenario B: New message or initial load (scroll to bottom)
        else {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, chatEndRef]);

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface scrollbar-thin scrollbar-thumb-surface-muted"
        >
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