import { useEffect,useState } from "react";

export default function useContacts(currentUser){

    const [contacts, setContacts] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    //load from storage
     useEffect(() => {

        try{

            if (currentUser) {
                const storageKey = `chat_contacts_${currentUser.username}`;
                const saved = localStorage.getItem(storageKey);
                if (saved) setContacts(JSON.parse(saved));
            } else {
                setContacts([]);
            }
        }catch(error){
            console.log("An error occured while loading contacts : " + error);
            //if corrupted start fres
            setContacts([]);
        }

        setLoaded(true);

    }, [currentUser]);

   // 2. Save to Storage
    useEffect(() => {
        // only save if we have finished the initial load
        if (currentUser && loaded) { 
            const storageKey = `chat_contacts_${currentUser.username}`;
            localStorage.setItem(storageKey, JSON.stringify(contacts));
        }
    }, [contacts, currentUser, loaded]);

    function addToContacts(user) {
        if (!user || !user.username) return;
        setContacts(prev => {
            const exists = prev.some(u => u.username === user.username);
            if (exists) return prev;
            return [...prev, user];
        });
    }

    return {contacts, addToContacts, setContacts};
}