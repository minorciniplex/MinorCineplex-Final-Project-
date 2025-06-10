import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const RESERVATION_TIME = 15 * 60; // 15 minutes in seconds

const useCountdown = (seatNumber, showtimes, bookingId, couponId, booking_coupon_id, onSeatExpired) => {
  const [timeLeft, setTimeLeft] = useState(RESERVATION_TIME);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [onTimeExpire, setOnTimeExpire] = useState(false);
  const [couponIdForCancel, setCouponIdForCancel] = useState(null);
  const [bookingCouponIdForCancel, setBookingCouponIdForCancel] = useState(null);
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const startReservation = useCallback(async () => {
    try {
      if (!bookingId || !showtimes || !seatNumber) {
        console.error('Missing required parameters');
        return;
      }
      if (typeof seatNumber === "string") {
        try {
          // ถ้าเป็น JSON string array
          const parsed = JSON.parse(seatNumber);
          if (Array.isArray(parsed)) {
            seatNumber = parsed;
          } else if (seatNumber.includes(",")) {
            // ถ้าเป็น comma separated
            seatNumber = seatNumber.split(",").map(s => s.trim());
          } else {
            seatNumber = [seatNumber];
          }
        } catch {
          // ถ้า parse ไม่ได้ ให้ใช้ logic เดิม
          if (seatNumber.includes(",")) {
            seatNumber = seatNumber.split(",").map(s => s.trim());
          } else {
            seatNumber = [seatNumber];
          }
        }
      }

      // ดึงข้อมูลที่นั่งจากตาราง seats
      const response = await axios.get(`/api/fetchCountdown?bookingId=${bookingId}&showtimeId=${showtimes}`);
      const seatData = response.data.data;
      
      if (!seatData) {
        console.error('No seat data found');
        return;
      }

      // คำนวณเวลาที่เหลือ (วินาที) จาก reserved_until
      const reservedUntil = new Date(seatData.reserved_until).getTime();
      const now = Date.now();
      let secondsLeft = Math.floor((reservedUntil - now) / 1000);
      if (secondsLeft < 0) secondsLeft = 0;
      setTimeLeft(secondsLeft);
      setIsTimerActive(true);
      if (secondsLeft === 0) {
        setOnTimeExpire(true);
      }
    } catch (error) {
      console.error('Error starting reservation:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  }, [bookingId, showtimes, seatNumber]);

  const cancelReservation = useCallback(async () => {
    if (!bookingId || !showtimes || !seatNumber) {
      console.error('Missing required parameters for cancelReservation');
      return;
    }

    try {
     
      const response = await axios.post('/api/booking/cancel-booking', {
        bookingId: bookingId,
        seatNumber: Array.isArray(seatNumber) ? seatNumber : [seatNumber],
        showtimeId: showtimes,
      });

      if (response.status === 200) {
        setIsTimerActive(false);
        console.log('Reservation cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  }, [bookingId, seatNumber, showtimes]);

  const cancelCoupon = useCallback(async (couponIdParam, booking_coupon_idParam) => {
    const finalCouponId = couponIdParam || couponId;
    const finalBookingCouponId = booking_coupon_idParam || booking_coupon_id;
    
    console.log('cancelCoupon called with:', { finalCouponId, finalBookingCouponId });
    
    if (!finalCouponId || !finalBookingCouponId) {
      console.log('Missing required parameters for cancelCoupon, skipping...');
      return;
    }
    try {
      const response = await axios.post('/api/booking/cancel-coupon', {
        couponId: finalCouponId,
        booking_coupon_id: finalBookingCouponId,
      });
      console.log('Cancel coupon success:', response.data);
    } catch (error) {
      console.error('Error cancelling coupon:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }, [couponId, booking_coupon_id]);

const cancelCouponStatus = useCallback(async (couponIdParam) => {
  const finalCouponId = couponIdParam || couponId;
  
  console.log('cancelCouponStatus called with:', finalCouponId);
  
  if (!finalCouponId) {
    console.log('Missing required parameters for cancelCouponStatus, skipping...');
    return;
  }
  try {
    const response = await axios.put('/api/booking/cancel-coupon-status', {
      couponId: finalCouponId,
    });
    console.log('Cancel coupon status success:', response.data);
  } catch (error) {
    console.error('Error cancelling coupon status:', error);
  }
}, [couponId]);

  // ฟังก์ชันเมื่อเวลาหมด
  const handleExpire = useCallback(async () => {
    console.log('handleExpire called with:', { couponId, booking_coupon_id });
    try {
      // แสดง popup แทน alert
      if (onSeatExpired) {
        onSeatExpired();
      }
      await cancelReservation();
      
      // เรียก cancel coupon functions ถ้ามี coupon
      if (couponId || booking_coupon_id) {
        await cancelCoupon(couponId, booking_coupon_id);
        await cancelCouponStatus(couponId);
      }
    } catch (error) {
      console.error('Error in handleExpire:', error);
    }
  }, [cancelReservation, cancelCoupon, cancelCouponStatus, couponId, booking_coupon_id, onSeatExpired]);
// ทำงานเมื่อเวลาหมด
  useEffect(() => {
    if (onTimeExpire) {
      handleExpire();
    }
  }, [onTimeExpire]);

  // เมื่อ onTimeExpire เป็น true ให้ cancelReservation
  useEffect(() => {
    if (onTimeExpire) {
      cancelReservation();
      // แสดง popup แทน alert และไม่ redirect ที่นี่
      if (onSeatExpired) {
        onSeatExpired();
      }
    }
  }, [onTimeExpire, cancelReservation, seatNumber, onSeatExpired]);

  // Update timer
  useEffect(() => {
    let intervalId;
    if (isTimerActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setOnTimeExpire(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimerActive, timeLeft]);

  return {
    timeLeft,
    isTimerActive,
    formatTime,
    startReservation,
    cancelReservation,
    onTimeExpire,
    setOnTimeExpire,
    cancelCoupon,
    cancelCouponStatus
  };
};

export default useCountdown; 