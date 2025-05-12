import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar/Navbar";

export default function Test() {
  const [coupons, setCoupons] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [claimedCoupons, setClaimedCoupons] = useState(false);
  const [couponOwner, setCouponOwner] = useState([]);

  // ดึงข้อมูลคูปองทั้งหมดจาก API
  const fetchCoupons = async () => {
    try {
      const response = await axios.get("/api/test/fetch-coupon");
      setCoupons(response.data.data);
      setCouponOwner(response.data.data); // ตั้งค่า owner_name ของคูปองแรก
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  // ตรวจสอบสถานะการล็อกอินของผู้ใช้
  const checkAuthStatus = async () => {
    try {
      const res = await axios.get("/api/auth/status");
      if (res.data.loggedIn) {
        setIsLoggedIn(true);
        setUser(res.data.userId); // บันทึก userId
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsLoggedIn(false);
    }
  };

  // ฟังก์ชันที่เรียกใช้เมื่อผู้ใช้กดรับคูปอง
  const handleGetCoupon = async (couponId) => {
    // อัปเดตสถานะทันทีใน state ให้เป็น "เคลมแล้ว"
    setClaimedCoupons((prev) => ({
      ...prev,
      [couponId]: true, // กำหนดว่าอันนี้ถูกเคลมแล้ว
    }));

    try {
      const response = await axios.post("/api/test/get-coupon", {
        couponId: couponId,
      });

      if (!response.data.success) {
        // ถ้าเคลมไม่สำเร็จ ให้รีเซ็ตสถานะกลับเป็น false
        setClaimedCoupons((prev) => ({
          ...prev,
          [couponId]: false,
        }));
      } else {
        console.log("Coupon received:", response.data);
      }
    } catch (error) {
      console.error(
        "Error getting coupon:",
        error.response?.data || error.message
      );
      // ถ้ามีข้อผิดพลาดในการเรียก API ให้รีเซ็ตสถานะเป็น false
      setClaimedCoupons((prev) => ({
        ...prev,
        [couponId]: false,
      }));
    }
  };

  // ฟังก์ชันที่จะเรียกใช้เพื่อตรวจสอบสถานะของคูปอง
  const checkUserCoupon = async (couponId) => {
    try {
      const response = await axios.get(`/api/test/check-coupon?coupon_id=${couponId}`);
      setClaimedCoupons((prev) => ({
        ...prev,
        [couponId]: response.data.claimed
      }));
    } catch (error) {
      console.error("Error checking user coupon:", error);
    }
  };

  // ดึงข้อมูลคูปองและเช็คสถานะการล็อกอิน
  useEffect(() => {
    fetchCoupons();
    checkAuthStatus();
  }, []);

  // เมื่อได้รับคูปองแล้วให้ตรวจสอบสถานะของคูปอง
  useEffect(() => {
    if (coupons.length > 0) {
      coupons.forEach(coupon => {
        checkUserCoupon(coupon.coupon_id);
      });
    }
  }, [coupons]);

  return (
    <div>
      <Navbar/>
      <button
        className="bg-slate-500 w-40 h-16"
        onClick={() => fetchCoupons()}
      >
        ทั้งหมด
      </button>

      {couponOwner?.map((coupon) => (
        <button
          key={coupon.coupon_id}
          className="bg-slate-500 w-40 h-16"
          onClick={() => fetchCoupons()} // ฟังก์ชันนี้จะทำให้โหลดข้อมูลคูปองใหม่เมื่อกด
        >
          {coupon.owner_name}
        </button>
      ))}

      {isLoggedIn ? (
        <h1 className="text-3xl font-bold underline">Welcome back!</h1>
      ) : (
        <h1 className="text-3xl font-bold underline">Please log in</h1>
      )}

      <h2>Coupons</h2>
      {coupons.map((coupon) => (
        <div key={coupon.coupon_id}>
          <img src={coupon.image} alt={`Coupon ${coupon.coupon_id}`} />
          {claimedCoupons[coupon.coupon_id] ? (
            <button className="bg-slate-500 w-96 h-32">View Detail</button>
          ) : (
            <button
              className="bg-slate-500 w-96 h-32"
              onClick={() => handleGetCoupon(coupon.coupon_id)}
            >
              Get
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
