// components/ChatHeader.jsx
export default function ChatHeader({ currentUser, randomUsername, onLoginClick, onLogoutClick }) {
    return (
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
                <div className="h-3 w-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                
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