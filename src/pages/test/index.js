import { useState, useEffect } from "react";
import axios from "axios";

export default function Test() {
  const [coupons, setCoupons] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [isCouponClaimed, setIsCouponClaimed] = useState(false);

  // ดึงข้อมูลคูปองทั้งหมดจาก API
  const fetchCoupons = async () => {
    try {
      const response = await axios.get("/api/test/fetch-coupon");
      setCoupons(response.data.data);
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
    try {
      const response = await axios.post("/api/test/get-coupon", {
        couponId: couponId,
      });

      console.log("Coupon received:", response.data);
    } catch (error) {
      console.error(
        "Error getting coupon:",
        error.response?.data || error.message
      );
    }
  };

  /*     const checkUserCoupon = async (couponId) => {
    try {
      const res = await axios.post('/api/test/check-coupon', {
        user_id: user?.id,
        coupon_id: couponId,
      });

    } catch (err) {
      console.error('Error checking user coupon:', err);
    }
  }; */

  // ดึงข้อมูลคูปองและเช็คสถานะการล็อกอิน
  useEffect(() => {
    fetchCoupons();
    checkAuthStatus();
    /* checkUserCoupon(); */
  }, []);

  return (
    <div>
      {isLoggedIn ? (
        <h1 className="text-3xl font-bold underline">Welcome back!</h1>
      ) : (
        <h1 className="text-3xl font-bold underline">Please log in</h1>
      )}

      <h2>Coupons</h2>
      {coupons.map((coupon) => (
        <div key={coupon.coupon_id}>
          <img src={coupon.image} alt={`Coupon ${coupon.coupon_id}`} />
          {isCouponClaimed ? (
            // หากผู้ใช้ได้รับคูปองแล้ว แสดงปุ่ม "View Detail"
            <button className="bg-slate-500 w-96 h-32">View Detail</button>
          ) : (
            // หากยังไม่รับคูปอง แสดงปุ่ม "Get"
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
