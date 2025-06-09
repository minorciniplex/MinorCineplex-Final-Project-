import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export function useBookingDetail(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const fetchBooking = async () => {
      try {
        console.log('[useBookingDetail] Fetching booking for ID:', bookingId);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            user_id,
            showtime_id,
            booking_date,
            total_price,
            status,
            created_at,
            updated_at,
            reserved_until
          `)
          .eq('booking_id', bookingId)
          .maybeSingle();
        
        console.log('[useBookingDetail] Query result:', { data, error });
        
        if (error) {
          console.error('Booking detail error:', JSON.stringify(error, null, 2));
          setError(error);
        } else if (data) {
          console.log('[useBookingDetail] Booking found:', JSON.stringify(data, null, 2));
          setBooking(data);
        } else {
          console.log('[useBookingDetail] No booking found for ID:', bookingId);
          setBooking(null);
        }
      } catch (err) {
        console.error('[useBookingDetail] Fetch error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  return { booking, loading, error };
} 