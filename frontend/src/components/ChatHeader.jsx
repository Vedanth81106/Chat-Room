export default function ChatHeader({ currentUser, recipient, onLoginClick, onLogoutClick }) {
    
    const isDM = !!recipient;
    
    const title = isDM ? `Chat with ${recipient.username}` : "Global Chat Room";
    const status = isDM ? "Private Message " : "Live - Everyone can see this ";

    return (
        <div className={`p-4 flex justify-between items-center border-b z-10 transition-colors duration-300 bg-indigo-50 border-indigo-100 ${
            isDM 
            ? "bg-surface border-surface-muted" 
            : "bg-surface border-surface-muted"
        }`}>
            
            {/* Left Side: Title & Status */}
            <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDM ? "text-indigo-700" : "text-text-primary"}`}>
                    {title}
                </h2>
                <p className={`text-sm ${isDM ? "text-indigo-400" : "text-text-muted"}`}>
                    {status}
                </p>
            </div>
            
            {/* Right Side: Login/Logout Buttons */}
            <div className="flex items-center gap-4">
                {/* Active Status Dot */}
                <div className={`h-3 w-3 rounded-full animate-pulse ${isDM ? "bg-indigo-500" : "bg-green-500"}`}></div>

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
    );
}