import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStatus } from '@/context/StatusContext';

export const useCouponClaim = (couponId) => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStatus();

  const handleClaimCoupon = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนรับคูปอง');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/coupons/get-coupon-to-user', {
        user_id: user.id,
        coupon_id: couponId,
      });

      if (res.data.success) {
        alert('รับคูปองสำเร็จ');
        setIsClaimed(true);
        // เช็คสถานะใหม่หลังจากรับคูปอง
        await checkUserCoupon();
      } else {
        alert(res.data.error || 'ไม่สามารถรับคูปองได้');
        // ถ้าเป็น error ว่ามีคูปองอยู่แล้ว ให้เช็คสถานะใหม่
        if (res.data.error === 'คุณมีคูปองนี้อยู่แล้ว') {
          setIsClaimed(true);
        }
      }
    } catch (err) {
      console.error('Error claiming coupon:', err);
      if (err.response?.data?.error === 'คุณมีคูปองนี้อยู่แล้ว') {
        setIsClaimed(true);
      } else {
        alert('เกิดข้อผิดพลาดขณะรับคูปอง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserCoupon = async () => {
    if (!user || !couponId) return;
    
    try {
      const res = await axios.post('/api/coupons/check-claimed-coupon', {
        user_id: user.id,
        coupon_id: couponId,
      });

      if (res.data.success && !res.data.claimed) {
        setIsClaimed(false);
      } else {
        setIsClaimed(true);
      }
    } catch (err) {
      console.error('Error checking user coupon:', err);
    }
  };

  // เช็คสถานะคูปองเมื่อ user เปลี่ยนหรือ couponId เปลี่ยน
  useEffect(() => {
    if (user) {
      checkUserCoupon();
    }
  }, [user, couponId]);

  return {
    isClaimed,
    isLoading,
    handleClaimCoupon,
    checkUserCoupon
  };
}; 