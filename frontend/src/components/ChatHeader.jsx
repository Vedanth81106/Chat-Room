import SearchBar from "./SearchBar";

export default function ChatHeader({
     currentUser, recipient, onLoginClick, onLogoutClick,
     isSearching, onToggleSearch, onSearchSubmit, randomUsername
     }) {
    
    const isDM = !!recipient;
    
    const title = isDM ? `Chat with ${recipient.username}` : "Global Chat Room";
    const status = isDM ? "Private Message " : "Live - Everyone can see this ";

return (
        <div className="h-16 border-b border-surface-muted flex items-center justify-between px-6 bg-surface shadow-sm relative overflow-hidden">
            
            {/* 1. Show SearchBar if active */}
            {isSearching && (
                <SearchBar 
                    onClose={() => onToggleSearch(false)} 
                    onSubmit={onSearchSubmit} 
                />
            )}

            {/* 2. Normal Header Content (Fade out when searching) */}
            <div className={`flex items-center gap-3 flex-1 transition-opacity duration-200 ${isSearching ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`w-3 h-3 rounded-full ${currentUser ? "bg-green-500" : "bg-gray-400"}`} />
                <h2 className="font-semibold text-text-primary text-lg truncate max-w-[200px]">
                    {recipient ? `${recipient.username}` : "Global Chat"}
                </h2>
                {recipient && <span className="text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded-full">Private</span>}
            </div>

            {/* 3. Right Side Actions (Fade out when searching) */}
            <div className={`flex items-center gap-3 transition-opacity duration-200 ${isSearching ? 'opacity-0' : 'opacity-100'}`}>
                
                {/* Search Trigger Button */}
                <button 
                    onClick={() => onToggleSearch(true)}
                    className="p-2 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-surface-muted"
                    title="Search Messages"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>

                {currentUser ? (
                    <div className="flex items-center gap-3 pl-3 border-l border-surface-muted">
                        <span className="text-sm font-medium text-text-secondary hidden sm:block">
                            {currentUser.username}
                        </span>
                        <button onClick={onLogoutClick} className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all font-medium">
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-text-muted italic hidden sm:block">{randomUsername}</span>
                        <button onClick={onLoginClick} className="text-xs bg-accent text-white px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors font-medium shadow-sm">
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}