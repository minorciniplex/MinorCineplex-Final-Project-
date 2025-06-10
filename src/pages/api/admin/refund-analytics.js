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

    const { range = '30d' } = req.query;
    
    // คำนวณช่วงวันที่
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Mock data สำหรับ demo (จริงๆ ควรดึงจาก database)
    const analytics = {
      dailyRefunds: generateDailyRefunds(startDate, now),
      monthlyRefunds: generateMonthlyRefunds(startDate, now),
      gatewayStats: [
        {
          name: 'Stripe',
          refunds: 45,
          successRate: 98.2,
          status: 'active'
        },
        {
          name: 'Omise',
          refunds: 32,
          successRate: 96.8,
          status: 'active'
        },
        {
          name: 'PayPal',
          refunds: 18,
          successRate: 94.4,
          status: 'active'
        }
      ],
      recentRefunds: [
        {
          bookingId: 'BK001234',
          customerName: 'สมชาย ใจดี',
          amount: 580,
          gateway: 'Stripe',
          status: 'completed',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          bookingId: 'BK001235',
          customerName: 'สุกัญญา สวยงาม',
          amount: 720,
          gateway: 'Omise',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          bookingId: 'BK001236',
          customerName: 'วิชัย เก่งมาก',
          amount: 460,
          gateway: 'PayPal',
          status: 'pending',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          bookingId: 'BK001237',
          customerName: 'นิรมล รักสนุก',
          amount: 380,
          gateway: 'Stripe',
          status: 'completed',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          bookingId: 'BK001238',
          customerName: 'มานะ ทำงานหนัก',
          amount: 640,
          gateway: 'Omise',
          status: 'failed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      refundReasons: [
        { reason: 'ยกเลิกการจอง', count: 45, percentage: 47.4 },
        { reason: 'เปลี่ยนแปลงรอบฉาย', count: 28, percentage: 29.5 },
        { reason: 'ปัญหาทางเทคนิค', count: 15, percentage: 15.8 },
        { reason: 'อื่นๆ', count: 7, percentage: 7.3 }
      ],
      summary: {
        totalRefunds: 95,
        totalAmount: 52780,
        successRate: 96.8,
        averageAmount: 555,
        pendingRefunds: 8,
        failedRefunds: 3
      }
    };

    // ถ้ามี table refunds จริง ให้ใช้โค้ดนี้แทน
    /*
    try {
      // ดึงข้อมูลจริงจาก database
      const { data: refunds, error } = await supabase
        .from('refunds')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // คำนวณสถิติจริง
      const totalRefunds = refunds?.length || 0;
      const completedRefunds = refunds?.filter(r => r.status === 'completed') || [];
      const pendingRefunds = refunds?.filter(r => r.status === 'pending') || [];
      const failedRefunds = refunds?.filter(r => r.status === 'failed') || [];
      
      const totalAmount = completedRefunds.reduce((sum, r) => sum + (r.amount || 0), 0);
      const successRate = totalRefunds > 0 ? (completedRefunds.length / totalRefunds) * 100 : 0;
      const averageAmount = completedRefunds.length > 0 ? totalAmount / completedRefunds.length : 0;

      analytics.summary = {
        totalRefunds,
        totalAmount,
        successRate,
        averageAmount,
        pendingRefunds: pendingRefunds.length,
        failedRefunds: failedRefunds.length
      };

      analytics.recentRefunds = refunds?.slice(0, 10).map(refund => ({
        bookingId: refund.booking_id,
        customerName: refund.customer_name || 'N/A',
        amount: refund.amount,
        gateway: refund.gateway,
        status: refund.status,
        createdAt: refund.created_at
      })) || [];

    } catch (dbError) {
      console.log('Database error (using mock data):', dbError.message);
    }
    */

    res.json(analytics);

  } catch (error) {
    console.error('Refund analytics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Helper functions สำหรับ generate mock data
function generateDailyRefunds(startDate, endDate) {
  const days = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    days.push({
      date: current.toISOString().split('T')[0],
      refunds: Math.floor(Math.random() * 10) + 1,
      amount: Math.floor(Math.random() * 5000) + 1000
    });
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

function generateMonthlyRefunds(startDate, endDate) {
  const months = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (current <= endDate) {
    months.push({
      month: current.toISOString().substr(0, 7), // YYYY-MM
      refunds: Math.floor(Math.random() * 50) + 20,
      amount: Math.floor(Math.random() * 50000) + 20000
    });
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
} 