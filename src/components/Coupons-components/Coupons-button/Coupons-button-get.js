import {useState} from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CouponsButtonGet() {
    const[isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        checkAuthStatus();
    }, [isLoggedIn]);

    const checkAuthStatus = async () => {
    try {
      // เรียก API เพื่อเช็คว่าผู้ใช้ login อยู่มั้ย
      const res = await axios.get("/api/auth/status", /* {
        withCredentials: true,
      } */);
      if (res.data.loggedIn) {
        setIsLoggedIn(true);
        setUser(res.data.userId);
        
        
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsLoggedIn(false);
    }
  };

    return (
        <button className="bg-brand-blue-100 text-white px-4 py-2 rounded-md [285px] hover:bg-[#070C1B] transition-colors duration-200">
            Get coupon
        </button>
    )
}

