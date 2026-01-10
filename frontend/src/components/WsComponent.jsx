import { useEffect, useMemo, useRef, useState } from "react";

import useWebSocket from "../hooks/useWebSocket";
import useMessageHistory from "../hooks/useMessageHistory";
import useContacts from "../hooks/useContacts";
import useSearch from "../hooks/useSearch";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import UserList from "./UserList";

export default function WsComponent({ currentUser, onLoginClick, onLogoutClick }) {

    const [typingUser, setTypingUser] = useState("");
    const [recipient, setRecipient] = useState(null);

    const chatEndRef = useRef(null);
    const currentUserRef = useRef(currentUser);

    // keeps the ref updated with current user for websocket callbacks
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    function handleTyping(username) {
        setTypingUser(username);
        setTimeout(() => setTypingUser(""), 3000);
    }

    // message history hook
    const{
        messages,
        setMessages,
        fetchHistory,
        isLoading,
        setIsLoading,
        hasMore,
        setHasMore
    } = useMessageHistory();

    // contact persistence
    const { contacts, addToContacts } = useContacts(currentUser);

     // search hook
    const { handleSearch,
        exitSearch,
        isSearching,
        setIsSearching } = useSearch({recipient,setMessages,fetchHistory, setIsLoading, setHasMore});

    // websocket connection
    const { sendMessage, sendTyping } = useWebSocket({
        currentUser,
        isSearching,
        onGlobalMessage: (msg) => setMessages(prev => [...prev,msg]),
        onPrivateMessage : (msg) => setMessages(prev => [...prev,msg]),
        addToContacts: (user) => addToContacts(user),
        onTyping: handleTyping
    })

    // handle recipient change
    useEffect(() => {
        // only fetches history if not in search mode
        if (!isSearching) {
            setMessages([]);
            setHasMore(true);
            if (recipient) fetchHistory(null, recipient.id);
            else fetchHistory(null, null);
        }
    }, [recipient]);

    // generates a random name for guests
    const randomUsername = useMemo(() => {
        const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Angry"];
        const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bear"];
        return "Guest_" + adjectives[Math.floor(Math.random() * 5)]
        + nouns[Math.floor(Math.random() * 5)]
        + Math.floor(Math.random() * 1000);
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
                            onSendMessage={(content) => sendMessage(content, recipient?.username)}
                            onTyping={sendTyping}
                            currentUser={currentUser}
                            onLoginClick={onLoginClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}