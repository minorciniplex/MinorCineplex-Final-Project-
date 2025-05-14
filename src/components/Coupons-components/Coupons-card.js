import { useRouter } from 'next/navigation';
import { useStatus } from '@/context/StatusContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Loading } from '../ui/loading';
function CouponsCard({ coupon_id, image, title, end_date }) {
  const router = useRouter();
  const { isLoggedIn, user, loading } = useStatus();
  const [isClaimed, setIsClaimed] = useState(false);

  const handleClaimCoupon = async (couponId) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนรับคูปอง');
      return;
    }

    try {
      const res = await axios.post('/api/coupons/get-coupon-to-user', {
        user_id: user.id,
        coupon_id: couponId,
      });

      if (res.data.success) {
        alert('รับคูปองสำเร็จ');
        setIsClaimed(true); // เปลี่ยนสถานะหลังรับสำเร็จ
      } else {
        alert(res.data.error || 'ไม่สามารถรับคูปองได้');
      }
    } catch (err) {
      console.error('Error claiming coupon:', err);
      alert('เกิดข้อผิดพลาดขณะรับคูปอง');
    }
  };

  const checkUserCoupon = async () => {
    try {
      const res = await axios.post('/api/coupons/check-claimed-coupon', {
        user_id: user?.id,
        coupon_id: coupon_id,
      });

      if (res.data.success && !res.data.claimed) {
        setIsClaimed(false); // ยังไม่เคลม
      } else {
        setIsClaimed(true); // เคลมแล้ว
      }
    } catch (err) {
      console.error('Error checking user coupon:', err);
    }
  };

  useEffect(() => {
    if (user) {
      checkUserCoupon();
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    
    <div className="flex flex-col gap-4">
      <img
        className="w-[285px] h-[285px] object-cover rounded-md cursor-pointer"
        src={image}
        alt={title}
        onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
      />

      <button onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}>
        <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline">
          {title}
        </h2>
      </button>

      <div>
        <p>วันที่หมดอายุ: {end_date}</p>
      </div>


      
    
      {!isClaimed ? (
        <button
          className="bg-brand-blue-100 text-white px-4 py-2 rounded-md hover:bg-[#070C1B] transition-colors duration-200"
          onClick={() => isLoggedIn ? handleClaimCoupon(coupon_id) : router.push('/auth/login')}
        >
          รับคูปอง
        </button>
      ) : (
        <button
          className="bg-gray-300 text-white px-4 py-2 rounded-md cursor-default"
          onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
        >
          view detail 
        </button>
      )}
    </div>
  );
}

export default CouponsCard;
