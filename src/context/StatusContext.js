import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const StatusContext = createContext();

export function StatusProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // ตรวจสอบว่าอยู่ใน client หรือไม่
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // เฉพาะเมื่ออยู่ใน client เท่านั้นถึงจะเช็ค auth status
    if (isClient) {
      checkAuthStatus();
    }
  }, [isClient]);

  const value = { 
    isLoggedIn, 
    user, 
    loading: loading || !isClient, // loading จะเป็น true ถ้ายังโหลดอยู่หรือยังไม่ได้อยู่ใน client
    checkAuthStatus 
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
    throw new Error("useStatus must be used within a StatusProvider");
  }
  return context;
}
