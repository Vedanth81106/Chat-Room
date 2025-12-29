import { useMemo } from "react";
import UserSearch from "./UserSearch";

// 👇 accepting 'contacts' as a new prop
export default function UserList({ messages, contacts, selectedUser, onSelectUser, currentUser }) {

    const displayedUsers = useMemo(() => {
        const uniqueUsers = new Map();

        // 1. Add "Sticky" Contacts (From LocalStorage/State)
        // These stay even if you click away or have no messages
        if (contacts) {
            contacts.forEach(u => uniqueUsers.set(u.username, u));
        }

        // 2. Add the Currently Selected User (Instant feedback)
        if (selectedUser && selectedUser.username) {
            uniqueUsers.set(selectedUser.username, selectedUser);
        }

        // 3. Add everyone from Message History
        if (currentUser && messages) {
            messages.forEach(msg => {
                if (!msg.user || !msg.recipient) return;

                let otherPerson = null;
                if (msg.user.username === currentUser.username) {
                    otherPerson = msg.recipient; 
                } else if (msg.recipient.username === currentUser.username) {
                    otherPerson = msg.user;      
                }

                if (otherPerson && otherPerson.username) {
                    uniqueUsers.set(otherPerson.username, otherPerson);
                }
            });
        }

        return Array.from(uniqueUsers.values());
        
    }, [messages, contacts, selectedUser, currentUser]);

    return (
        <div className="w-64 bg-surface border-r border-surface-muted flex flex-col h-full">
            
            <UserSearch onSelectUser={onSelectUser} />

            <div className="p-4 border-b border-surface-muted font-bold text-text-primary text-xs uppercase tracking-wider">
                My Chats
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {/* Global Chat */}
                <button
                    onClick={() => onSelectUser(null)}
                    className={`w-full text-left p-3 hover:bg-surface-muted transition-colors flex items-center gap-3 border-b border-surface-muted ${
                        !selectedUser ? "bg-accent/10 border-r-4 border-accent" : ""
                    }`}
                >
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        #
                    </div>
                    <div>
                        <p className="font-bold text-text-primary text-sm">Global Chat</p>
                        <p className="text-xs text-text-muted">Public Room</p>
                    </div>
                </button>

                {/* Merged User List */}
                {displayedUsers.map(user => (
                    <button
                        key={user.username}
                        onClick={() => onSelectUser(user)}
                        className={`w-full text-left p-3 hover:bg-surface-muted transition-colors flex items-center gap-3 border-b border-surface-muted ${
                            selectedUser?.username === user.username ? "bg-accent/10 border-r-4 border-accent" : ""
                        }`}
                    >
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-text-primary text-sm">{user.username}</p>
                            <p className="text-xs text-text-muted truncate w-32">
                                {selectedUser?.username === user.username ? "Active Now" : "Open Chat"}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Profile Footer */}
            <div className="p-4 bg-surface-muted border-t border-surface-muted">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        {currentUser?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-text-primary text-sm truncate">
                            {currentUser?.username}
                        </p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="block w-2 h-2 rounded-full bg-green-500"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}