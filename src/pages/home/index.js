import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [notLoginPicture, setNotLoginPicture] = useState(null);
  const [loginPicture, setLoginPicture] = useState(null);

  useEffect(() => {
    checkAuthStatus();
   /*  if(!isLoggedIn) {
      notLogin()
    }
    else if (isLoggedIn) {
      login()
    } */


    console.log(user); 
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

  const handleCheackAuthStatus = async () => {
    try {
      // เรียก API เพื่อเช็คว่าผู้ใช้ login อยู่มั้ย
      const res = await axios.get("/api/auth/status", /* {
        withCredentials: true,
      } */);
      if (res.data.loggedIn) {
        alert("Logged In")
        
      } else {
        alert("Not Logged In")
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // เรียก API logout ฝั่ง server เพื่อลบ cookie
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true, // ส่ง cookie ไปด้วย
        }
      );

      console.log("Logout successful");
      setIsLoggedIn(false);

      
      
      
    } catch (err) {
      console.error("Logout failed:", err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  const notLogin = async() => {
    try {
      const res = await axios.get("/api/auth/get")
      setNotLoginPicture(res.data.data.poster_url)
      console.log("notLoginPicture", res.data.data.poster_url)
    }
    catch (err) {
      console.error("Error fetching picture:", err);
    }
  }

  const login = async() => {
    try {
      const res = await axios.get("/api/auth/get-cookies")
      setLoginPicture(res.data.data.poster_url)
      console.log("loginPicture", res.data.data.poster_url)
      
    }
    catch (err) {
      console.error("Error fetching picture:", err);
    }
  }

  return (
    <>
      <div className="headline-1 text-center">
        <h1>This is Home Landing Page</h1>
        <button
          onClick={handleLogout}
          className="btn btn-primary mt-4"
          disabled={isLoading}
        >
          {isLoading ? "กำลังออกจากระบบ..." : "Logout"}
        </button>
        <Link href="/auth/login" className="btn btn-primary mt-4">
          Login
        </Link>
        <br/>
        <button className="btn btn-primary mt-4"
        onClick={() => {
          checkAuthStatus();
          {isLoggedIn ? login() : notLogin()}
        }}>
          get
          </button>
        <br/>
        <button className="btn btn-primary mt-4"
        onClick={handleCheackAuthStatus}>
          check auth status
          </button>
      
        <img
          src={isLoggedIn ? loginPicture : notLoginPicture}
          className="w-1/2 h-auto mx-auto mt-4"
        />
      </div>
      {isLoggedIn ? <p className="text-3xl">Logged In</p> : <p className="text-3xl">Not Logged In</p>}
    </>
  );
}
