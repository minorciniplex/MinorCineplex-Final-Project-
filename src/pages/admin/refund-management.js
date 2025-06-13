import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RefundManagement() {
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [refundHistory, setRefundHistory] = useState([]);

  useEffect(() => {
    checkServiceStatus();
    fetchRefundHistory();
  }, []);

  const checkServiceStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/test/refund-status');
      setServiceStatus(response.data.data);
    } catch (error) {
      console.error('Error checking service status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundHistory = async () => {
    try {
      // This would be implemented to fetch refund history
      // const response = await axios.get('/api/admin/refund-history');
      // setRefundHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching refund history:', error);
    }
  };

  const testRefundService = async (gateway) => {
    try {
      setTestResult({ loading: true, gateway });
      
      // This would test the actual refund service
      const response = await axios.post('/api/test/refund-test', {
        gateway: gateway,
        testMode: true
      });
      
      setTestResult({
        loading: false,
        gateway,
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      });
    } catch (error) {
      setTestResult({
        loading: false,
        gateway,
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            💳 ระบบคืนเงินจริง
          </h1>
          <p className="text-gray-600">
            จัดการและติดตามระบบคืนเงินอัตโนมัติผ่าน Payment Gateway
          </p>
        </div>

        {/* Service Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 สถานะระบบ</h2>
          
          {serviceStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stripe Status */}
              <div className={`p-4 rounded-lg border-2 ${
                serviceStatus.serviceStatus.stripe.configured 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stripe</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    serviceStatus.serviceStatus.stripe.configured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serviceStatus.serviceStatus.stripe.configured ? 'พร้อมใช้งาน' : 'ไม่ได้ตั้งค่า'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Secret Key: {serviceStatus.environmentCheck.stripe.secretKey ? '✅' : '❌'}</div>
                  <div>Webhook Secret: {serviceStatus.environmentCheck.stripe.webhookSecret ? '✅' : '❌'}</div>
                </div>
                {serviceStatus.serviceStatus.stripe.configured && (
                  <button
                    onClick={() => testRefundService('stripe')}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    ทดสอบ Stripe
                  </button>
                )}
              </div>

              {/* Omise Status */}
              <div className={`p-4 rounded-lg border-2 ${
                serviceStatus.serviceStatus.omise.configured 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Omise</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    serviceStatus.serviceStatus.omise.configured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serviceStatus.serviceStatus.omise.configured ? 'พร้อมใช้งาน' : 'ไม่ได้ตั้งค่า'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Secret Key: {serviceStatus.environmentCheck.omise.secretKey ? '✅' : '❌'}</div>
                  <div>Webhook Secret: {serviceStatus.environmentCheck.omise.webhookSecret ? '✅' : '❌'}</div>
                </div>
                {serviceStatus.serviceStatus.omise.configured && (
                  <button
                    onClick={() => testRefundService('omise')}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    ทดสอบ Omise
                  </button>
                )}
              </div>

              {/* PayPal Status */}
              <div className={`p-4 rounded-lg border-2 ${
                serviceStatus.serviceStatus.paypal.configured 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">PayPal</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    serviceStatus.serviceStatus.paypal.configured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serviceStatus.serviceStatus.paypal.configured ? 'พร้อมใช้งาน' : 'ไม่ได้ตั้งค่า'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Client ID: {serviceStatus.environmentCheck.paypal.clientId ? '✅' : '❌'}</div>
                  <div>Client Secret: {serviceStatus.environmentCheck.paypal.clientSecret ? '✅' : '❌'}</div>
                  <div>Environment: {serviceStatus.environmentCheck.paypal.environment}</div>
                </div>
                {serviceStatus.serviceStatus.paypal.configured && (
                  <button
                    onClick={() => testRefundService('paypal')}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    ทดสอบ PayPal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🧪 ผลการทดสอบ</h2>
            
            {testResult.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>กำลังทดสอบ {testResult.gateway}...</span>
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-lg ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.success ? '✅' : '❌'}
                  </span>
                  <span className="font-semibold">
                    {testResult.gateway.toUpperCase()} Test
                  </span>
                </div>
                <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                  {testResult.message || testResult.error}
                </p>
                {testResult.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {serviceStatus?.recommendations && serviceStatus.recommendations.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">💡 คำแนะนำ</h2>
            <div className="space-y-3">
              {serviceStatus.recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  rec.priority === 'HIGH' ? 'border-red-400 bg-red-50' :
                  rec.priority === 'MEDIUM' ? 'border-yellow-400 bg-yellow-50' :
                  'border-blue-400 bg-blue-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {serviceStatus?.nextSteps && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📋 ขั้นตอนถัดไป</h2>
            <div className="space-y-2">
              {serviceStatus.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Setup Guide */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Quick Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600 mb-2">1. Stripe (แนะนำ)</h3>
              <p className="text-sm text-gray-600 mb-3">ง่ายที่สุด เหมาะสำหรับเริ่มต้น</p>
              <div className="text-xs space-y-1">
                <div>• สร้างบัญชีที่ stripe.com</div>
                <div>• รับ Secret Key</div>
                <div>• เพิ่มใน .env.local</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">2. Omise (ไทย)</h3>
              <p className="text-sm text-gray-600 mb-3">เหมาะสำหรับตลาดไทย</p>
              <div className="text-xs space-y-1">
                <div>• สร้างบัญชีที่ omise.co</div>
                <div>• รับ Secret Key</div>
                <div>• รองรับ PromptPay</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600 mb-2">3. PayPal (โลก)</h3>
              <p className="text-sm text-gray-600 mb-3">เหมาะสำหรับระดับโลก</p>
              <div className="text-xs space-y-1">
                <div>• สร้างบัญชีที่ developer.paypal.com</div>
                <div>• รับ Client ID & Secret</div>
                <div>• ตั้งค่า Sandbox/Live</div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-semibold text-blue-900">เอกสารประกอบ</h2>
          </div>
          <p className="text-blue-700 mb-3">
            คู่มือการติดตั้งและใช้งานระบบคืนเงินจริงแบบละเอียด
          </p>
          <a 
            href="/docs/REFUND_SYSTEM_SETUP.md" 
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <span>📖 อ่านเอกสารเต็ม</span>
          </a>
        </div>
      </div>
    </div>
  );
} 