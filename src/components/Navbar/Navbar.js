import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useStatus } from "@/context/StatusContext";
import NavbarWithLogin from "./NavbarWithLogin";
import NavbarWithOutLogin from "./NavbarWithOutLogin";
import NavbarLoading from "./NavbarLoading";

const Navbar = () => {
  const { isLoggedIn, loading } = useStatus();
  const [isClient, setIsClient] = useState(false);

  // แก้ไข hydration error โดยใช้ useEffect เพื่อตรวจสอบว่าอยู่ในฝั่ง client หรือไม่
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ถ้ายังไม่ได้อยู่ในฝั่ง client หรือกำลัง loading ให้แสดง NavbarLoading
  if (!isClient || loading) {
    return <NavbarLoading />;
  }

  // เมื่ออยู่ในฝั่ง client แล้วและโหลดเสร็จแล้ว ให้แสดง navbar ตามสถานะการล็อกอิน
  return isLoggedIn ? <NavbarWithLogin /> : <NavbarWithOutLogin />;
};

export default Navbar; 