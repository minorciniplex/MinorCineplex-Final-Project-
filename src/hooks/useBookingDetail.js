import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';

export function useBookingDetail(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    supabase
      .from('booking_detail')
      .select('*')
      .eq('id', bookingId)
      .single()
      .then(({ data }) => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  return { booking, loading };
} 