import { useState, useCallback, useRef} from "react";
import { getToken } from "../utils/auth";
import { baseURL } from "../utils/config";

export default function useMessageHistory(){

    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [messages, setMessages] = useState([]);

    const isLoadingRef = useRef(false);

    // Wrapped in useCallback so it doesn't trigger infinite loops in useEffects
    const fetchHistory = useCallback(async (beforeTimestamp = null, userId = null) => {
        if (isLoadingRef.current) return;//prevents double fetch

        isLoadingRef.current = true;
        setIsLoading(true);

        const token = getToken();
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        try {
            let url = userId 
                ? `${baseURL}/api/messages/user/${userId}`
                : `${baseURL}/api/messages`;

            // adds timestamp param if scrolling up, encodes it to handle spaces
            if (beforeTimestamp) {
                url += `${url.includes('?') ? '&' : '?'}before=${encodeURIComponent(beforeTimestamp)}`;
            }
            
            const res = await fetch(url, { headers });
            
            // stops execution if permission denied or error occurs
            if (!res.ok) {
                throw new Error(`Failed to fetch history. Status: ${res.status}`);
            }

            const data = await res.json();

            // determines if there are more messages to load
            if (data.length < 50) setHasMore(false);
            else setHasMore(true); 

            // prepends old messages or sets initial load
            if (beforeTimestamp) setMessages(prev => [...data, ...prev]);
            else setMessages(data);
            
        } catch (err) {
            console.error(err);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }


    }, []); 

    return { 
        messages, 
        setMessages, 
        fetchHistory, 
        isLoading, 
        setIsLoading,
        hasMore, 
        setHasMore 
    };
}