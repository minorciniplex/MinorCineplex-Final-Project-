import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStatus } from '@/context/StatusContext';

export const useCouponClaim = (couponId) => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStatus();
  const [alertOpen, setAlertOpen] = useState(false);

  const handleClaimCoupon = async () => {
    if (!user) {
      alert('Please login before claiming coupon');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/coupons/get-coupon-to-user', {
        user_id: user.id,
        coupon_id: couponId,
      });

      if (res.data.success) {
        setIsClaimed(true);
        setAlertOpen(true);
        await checkUserCoupon();
      } else {
        alert(res.data.error || 'Unable to claim coupon');
        if (res.data.error === 'You already have this coupon') {
          setIsClaimed(true);
        }
      }
    } catch (err) {
      console.error('Error claiming coupon:', err);
      if (err.response?.data?.error === 'You already have this coupon') {
        setIsClaimed(true);
      } else {
        alert('Error occurred while claiming coupon');
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

 
  useEffect(() => {
    if (user) {
      checkUserCoupon();
    }
  }, [user, couponId]);

  return {
    isClaimed,
    isLoading,
    handleClaimCoupon,
    checkUserCoupon,
    alertOpen,
    setAlertOpen
  };
};

