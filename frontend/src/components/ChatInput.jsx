// components/ChatInput.jsx
export default function ChatInput({ input, setInput, sendMessage, handleTyping, currentUser, onLoginClick }) {
    
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    }

    if (!currentUser) {
        return (
            <div className="p-4 bg-surface border-t border-surface-muted">
                <div className="flex items-center justify-center p-3 bg-surface-muted rounded-full border border-surface-muted opacity-80 cursor-not-allowed">
                    <p className="text-text-muted text-sm">
                        <button onClick={onLoginClick} className="text-accent font-bold hover:underline cursor-pointer">
                            Login
                        </button>
                        {" "} to join the conversation
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-surface border-t border-surface-muted">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
                <textarea
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 p-3 bg-surface text-text-primary border border-surface-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none overflow-hidden"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
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
        </div>
    );
}