import { useEffect, useRef } from "react"; 
import SockJS from "sockjs-client";      
import Stomp from "stompjs";

import { getToken } from "../utils/auth";
import { baseURL } from "../utils/config";

export default function useWebSocket({
     currentUser,
     isSearching,
     onGlobalMessage,  
     onPrivateMessage,
     addToContacts,
     onTyping
}) {

    const ws = useRef(null);
    const currentUserRef = useRef(currentUser);
    const isSearchingRef = useRef(isSearching);

    // Update refs when props change
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
    useEffect(() => { isSearchingRef.current = isSearching; }, [isSearching]);


    useEffect(() => {
        const socket = new SockJS(`${baseURL}/ws`);
        const client = Stomp.over(socket);
        client.debug = () => { }; 
        ws.current = client;

        const token = getToken();
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        client.connect(headers, function (frame) {
            
            // Subscribes to global messages
            client.subscribe('/topic/messages', function (message) {
                const receivedMessage = JSON.parse(message.body);

                if(!isSearchingRef.current && onGlobalMessage){
                    onGlobalMessage(receivedMessage);
                }
            });

            // Subscribes to private messages
            client.subscribe('/user/queue/messages', function (message) {
                const receivedMessage = JSON.parse(message.body);
                
                if(!isSearchingRef.current && onPrivateMessage){
                    onPrivateMessage(receivedMessage);
                }
                
                // Adds sender to contacts list if it's a new person
                if (receivedMessage.user.username !== currentUserRef.current?.username) {
                    // Safety check
                    if (addToContacts) addToContacts(receivedMessage.user);
                }
            });

            // Subscribes to typing indicators
            client.subscribe('/topic/typing', function (message) {
                const username = message.body;
                if (currentUserRef.current && username === currentUserRef.current.username) return;
                if (onTyping) onTyping(username);
            });
        });

        return () => { 
            if (client && client.connected) client.disconnect(); 
        };
    }, []); // Connect once on mount

    function sendMessage(content, recipientUsername = null){
        if(!currentUserRef.current || !ws.current || !content.trim()) return;

        const msg = {
            username: currentUserRef.current.username,
            content: content,
            recipientUsername: recipientUsername
        };

        ws.current.send("/app/chat", {}, JSON.stringify(msg));
    }

    function sendTyping() {
        if (ws.current && ws.current.connected && currentUserRef.current) {
            ws.current.send("/app/typing", {}, currentUserRef.current.username);
        }
    }

    return { sendMessage, sendTyping };
}