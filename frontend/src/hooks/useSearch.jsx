import { useState } from "react";

import { getToken } from "../utils/auth";
import { baseURL } from "../utils/config";

export default function useSearch({ 
    recipient, 
    setMessages, 
    fetchHistory, 
    setIsLoading, 
    setHasMore 
}) {

    const [isSearching, setIsSearching] = useState(false);

    async function handleSearch(query) {
        if (!query.trim()) return;

        setIsLoading(true);
        setIsSearching(true);
        setHasMore(false); // Disable scrolling while searching

        try {
            const token = getToken();
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};

            let url = `${baseURL}/api/messages/search?content=${encodeURIComponent(query)}`;
            if (recipient) {
                url += `&recipientId=${recipient.id}`;
            }
            
            const res = await fetch(url, { headers });
            
            if (!res.ok) throw new Error("Search request failed");

            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsLoading(false);
        }
    }

    // Exits search mode and reloads normal history
    function exitSearch() {
        setIsSearching(false);
        setMessages([]); // Clear search results immediately
        
        // Reload original history
        if (recipient) fetchHistory(null, recipient.id);
        else fetchHistory(null, null);
    }

    return { handleSearch, exitSearch, isSearching, setIsSearching };
}