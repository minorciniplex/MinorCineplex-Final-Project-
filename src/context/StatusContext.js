import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const StatusContext = createContext();

export function StatusProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const res = await axios.get("/api/auth/status");
                if (res.data.loggedIn) {
                    setIsLoggedIn(true);
                    setUser(res.data.userId);
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } catch(err) {
                console.error("Error checking auth status:", err);
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const value = {
        isLoggedIn,
        user,
        loading
    };

    return (
        <StatusContext.Provider value={value}>
            {children}
        </StatusContext.Provider>
    );
}

export function useStatus() {
    const context = useContext(StatusContext);
    if (context === undefined) {
        throw new Error('useStatus must be used within a StatusProvider');
    }
    return context;
}