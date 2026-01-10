// components/UserSearch.jsx
import { useEffect, useState } from "react";
import {searchUsers} from '../utils/UserService'

export default function UserSearch({ onSelectUser }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(true); 

    useEffect(() => {
        const delayDebounceFn = setTimeout(async() => {
            if(query.length > 1){
                setSearching(true);

                try{
                    const response = await searchUsers(query);
                    setResults(response.data);
                }catch(error){
                    console.error("Search failed: " + error)
                }finally{
                    setSearching(false);
                }
            }else{
                setResults([]);
            }
        },500);

        return () => clearTimeout(delayDebounceFn);
    },[query]);

    return (
        <div className="p-4 border-b border-surface-muted bg-surface z-20 relative">
            <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">
                Direct Messages
            </h3>
            
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    className="w-full bg-surface-muted text-text-primary p-2 pl-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                {/* Search Icon */}
                <svg className="w-4 h-4 text-text-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Results Dropdown (Only show if we have results) */}
            {results.length > 0 && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-surface border border-surface-muted rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {results.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => {
                                onSelectUser(user); // Tell the parent component we picked someone
                                setQuery("");       // Clear search
                                setResults([]);     // Hide dropdown
                            }}
                            className="w-full text-left p-3 hover:bg-surface-muted transition-colors flex items-center gap-3 border-b border-surface-muted last:border-0"
                        >
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-text-primary">
                                {user.username}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}