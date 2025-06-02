import { useState, useEffect, useCallback } from 'react';

import axios from 'axios';
const RESERVATION_TIME = 15 * 60; // 15 minutes in seconds

const useCountdown = (seatNumber, showtimes, bookingId) => {
  const [timeLeft, setTimeLeft] = useState(RESERVATION_TIME);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [onTimeExpire, setOnTimeExpire] = useState(false);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const setCouponOntTimeExpire = useCallback(async (couponId) => {
    if (!couponId) {
      console.warn('No coupon ID provided for expiration');
      return;
    }

    try {
      const response = await axios.post('/api/booking/cancel-coupon', {
        couponId: couponId
      });

      if (response.data.success) {
        console.log('Coupon expiration handled successfully:', response.data.message);
      } else {
        console.warn('Coupon expiration warning:', response.data.message);
      }
    } catch (error) {
      console.error('Error handling coupon expiration:', error.response?.data?.error || error.message);
    }
  }, []);

  const startReservation = useCallback(async () => {
    try {
      if (!bookingId || !showtimes) {
        console.error('Missing required parameters: bookingId or showtimes');
        return;
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
  }, [bookingId, showtimes]);

  const cancelReservation = useCallback(async () => {
  try{
    const response = await axios.post('/api/booking/cancel-booking', {
      bookingId: bookingId,
      seatNumber: seatNumber,
      showtimeId: showtimes,
    });
    if (response.status === 200) {
      setIsTimerActive(false);
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
  }, []);

  // เมื่อ onTimeExpire เป็น true ให้ cancelReservation
  useEffect(() => {
    if (onTimeExpire) {
      alert("Reservation cancelled");
      cancelReservation();
      setCouponOntTimeExpire(seatNumber);
    }
  }, [onTimeExpire, cancelReservation, setCouponOntTimeExpire, seatNumber]);

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
    setCouponOntTimeExpire
  };
};

export default useCountdown; 