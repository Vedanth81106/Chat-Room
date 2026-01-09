import { useState } from "react";

export default function SearchBar({onClose, onSubmit}){

    const [text, setText] = useState("");

    function handleSubmit(e){

        e.preventDefault();

        if(text.trim()){
            onSubmit(text);
        }
    }
        
    return (
        <form 
            onSubmit={handleSubmit} 
            className="absolute inset-0 bg-surface z-20 flex items-center px-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Search Icon (Visual only) */}
            <span className="text-text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </span>

            {/* The Input Field */}
            <input
                autoFocus
                name="searchQuery" // Use this name to grab value in your logic
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search in conversation..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-text-primary placeholder:text-text-muted text-sm h-full"
                autoComplete="off"
            />

            {/* Close Button */}
            <button 
                type="button" 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-red-500 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </form>
    );
}