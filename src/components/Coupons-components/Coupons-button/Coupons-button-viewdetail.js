import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect } from 'react';
//หมายเหตุ: ใน Next.js เราจะใช้ useRouter จาก next/navigation สำหรับการ navigate ระหว่างหน้า ซึ่งเป็นวิธีที่แนะนำสำหรับ Next.js 13+ ครับ
export default function CouponsButtonViewDetail() {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [couponId, setCouponId] = useState(null);
    const router = useRouter();

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
    
    const handleClaimCoupon = async () => {
        try {
            const res = await axios.post('/api/coupons/get-coupons', {
                couponId: couponId,
                userId: user.id
            });
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div>
            
            <button 
                className={`bg-brand-blue-100 text-white px-4 py-2 rounded-md [285px] hover:bg-[#070C1B] transition-colors duration-200`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {isLoggedIn ? handleClaimCoupon() : router.push('/login')}}
            >
                {isHovered ? 'View details' : 'Get coupon'}
            </button>
           
        </div>
    )
}
