import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing bookingId' });
  }

  try {
    console.log('Checking payment status for booking:', bookingId);

    // 1. ตรวจสอบข้อมูล booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    // 2. ตรวจสอบข้อมูล payment
    const { data: payments, error: paymentError } = await supabase
      .from('movie_payments')
      .select('*')
      .eq('booking_id', bookingId);

    // 3. ตรวจสอบข้อมูล seats
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .eq('showtime_id', booking?.showtime_id)
      .in('seat_status', ['reserved', 'booked']);

    return res.status(200).json({
      success: true,
      data: {
        booking: {
          data: booking,
          error: bookingError
        },
        payments: {
          data: payments,
          error: paymentError,
          count: payments?.length || 0
        },
        seats: {
          data: seats,
          error: seatsError,
          count: seats?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Error in debug payment-status:', error);
    return res.status(500).json({ error: error.message });
  }
} 