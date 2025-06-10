import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

const RefundAnalyticsContent = () => {
  const { admin, loading } = useAdminAuth();
  const [analytics, setAnalytics] = useState({
    dailyRefunds: [],
    monthlyRefunds: [],
    gatewayStats: [],
    recentRefunds: [],
    refundReasons: [],
    summary: {
      totalRefunds: 0,
      totalAmount: 0,
      successRate: 0,
      averageAmount: 0,
      pendingRefunds: 0,
      failedRefunds: 0
    }
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    if (admin) {
      fetchAnalytics();
    }
  }, [admin, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/refund-analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching refund analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Refund Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              วิเคราะห์และติดตามระบบคืนเงิน
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 วันที่ผ่านมา</option>
              <option value="30d">30 วันที่ผ่านมา</option>
              <option value="90d">90 วันที่ผ่านมา</option>
              <option value="1y">1 ปีที่ผ่านมา</option>
            </select>

            <Link
              href="/admin/refund-management"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              จัดการระบบคืนเงิน
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">การคืนเงินทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loadingAnalytics ? '-' : analytics.summary.totalRefunds}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ยอดเงินคืนรวม</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingAnalytics ? '-' : `฿${analytics.summary.totalAmount?.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">อัตราสำเร็จ</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loadingAnalytics ? '-' : `${analytics.summary.successRate?.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loadingAnalytics ? '-' : analytics.summary.pendingRefunds}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ล้มเหลว</p>
                <p className="text-2xl font-bold text-red-600">
                  {loadingAnalytics ? '-' : analytics.summary.failedRefunds}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">เฉลี่ยต่อครั้ง</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {loadingAnalytics ? '-' : `฿${analytics.summary.averageAmount?.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Refunds Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 การคืนเงินรายวัน
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {loadingAnalytics ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <div className="text-center">
                  <p>Chart จะแสดงที่นี่</p>
                  <p className="text-sm">เมื่อมีข้อมูลการคืนเงิน</p>
                </div>
              )}
            </div>
          </div>

          {/* Gateway Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💳 ประสิทธิภาพ Payment Gateway
            </h3>
            <div className="space-y-4">
              {!loadingAnalytics && analytics.gatewayStats.length > 0 ? (
                analytics.gatewayStats.map((gateway, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        gateway.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{gateway.name}</p>
                        <p className="text-sm text-gray-600">{gateway.refunds} การคืนเงิน</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{gateway.successRate}%</p>
                      <p className="text-sm text-gray-600">อัตราสำเร็จ</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>ไม่มีข้อมูล Payment Gateway</p>
                  <p className="text-sm">ตั้งค่า Gateway ในหน้าจัดการระบบ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Refunds Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              🕒 การคืนเงินล่าสุด
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลูกค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gateway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!loadingAnalytics && analytics.recentRefunds.length > 0 ? (
                  analytics.recentRefunds.map((refund, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{refund.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {refund.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{refund.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {refund.gateway}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          refund.status === 'completed' ? 'bg-green-100 text-green-800' :
                          refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {refund.status === 'completed' ? 'สำเร็จ' :
                           refund.status === 'pending' ? 'รอดำเนินการ' : 'ล้มเหลว'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(refund.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {loadingAnalytics ? 'กำลังโหลดข้อมูล...' : 'ไม่มีข้อมูลการคืนเงิน'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const RefundAnalytics = () => {
  return (
    <>
      <Head>
        <title>Refund Analytics - Minor Cineplex Admin</title>
      </Head>
      <AdminAuthProvider>
        <RefundAnalyticsContent />
      </AdminAuthProvider>
    </>
  );
};

export default RefundAnalytics; 