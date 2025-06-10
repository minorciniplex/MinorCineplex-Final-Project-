import { verifyAdminToken } from '@/utils/adminAuth';
import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ดึงจำนวนหนังทั้งหมด
    const { count: totalMovies } = await supabase
      .from('movies')
      .select('*', { count: 'exact', head: true });

    // ดึงจำนวนการจองทั้งหมด
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // ดึงการจองของวันนี้
    const today = new Date().toISOString().split('T')[0];
    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // คำนวณรายได้รวม
    const { data: revenues } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'confirmed');

    const totalRevenue = revenues?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

    // ดึงสถิติการคืนเงิน (ถ้ามี table refunds)
    let totalRefunds = 0;
    let totalRefundAmount = 0;

    try {
      // ตรวจสอบว่ามี table refunds หรือไม่
      const { count: refundCount } = await supabase
        .from('refunds')
        .select('*', { count: 'exact', head: true });

      const { data: refundData } = await supabase
        .from('refunds')
        .select('amount')
        .eq('status', 'completed');

      totalRefunds = refundCount || 0;
      totalRefundAmount = refundData?.reduce((sum, refund) => sum + (refund.amount || 0), 0) || 0;
    } catch (refundError) {
      // Table refunds อาจยังไม่มี ใช้ค่า default
      console.log('Refunds table not found, using default values');
    }

    res.json({
      totalMovies: totalMovies || 0,
      totalBookings: totalBookings || 0,
      todayBookings: todayBookings || 0,
      totalRevenue: totalRevenue,
      totalRefunds: totalRefunds,
      totalRefundAmount: totalRefundAmount
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 