import { useState, useEffect } from "react";
import axios from "axios";

const TestNotifications = () => {
  const [testType, setTestType] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  // Load service status on component mount
  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        const response = await axios.get("/api/test/service-status");
        setServiceStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch service status:", error);
      }
    };
    
    fetchServiceStatus();
  }, []);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const testData = {
        email: email || undefined,
        phone: phone || undefined,
        name: name || undefined
      };

      const response = await axios.post("/api/test/send-test", {
        type: testType,
        testData: testData
      });

      setResults(response.data);
    } catch (error) {
      console.error("Test failed:", error);
      setResults({
        success: false,
        message: "Test failed",
        error: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--background-start] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">
          🔔 ทดสอบระบบแจ้งเตือน
        </h1>

        {/* Service Status */}
        {serviceStatus && (
          <div className="bg-[#070C1B] rounded-lg p-6 mb-6">
            <h2 className="text-white text-xl font-semibold mb-4">
              📊 สถานะบริการ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Status */}
              <div className="bg-[#21263F] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span>📧</span>
                  <span className="text-white font-medium">Email Service</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    serviceStatus.email.configured 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {serviceStatus.email.configured ? 'ใช้งานได้' : 'ยังไม่ตั้งค่า'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>✉️ Email User: {serviceStatus.email.hasEmailUser ? '✅' : '❌'}</p>
                  <p>🔑 Password: {serviceStatus.email.hasEmailPassword ? '✅' : '❌'}</p>
                  <p>📧 Valid Email: {serviceStatus.email.validEmailUser ? '✅' : '❌'}</p>
                </div>
              </div>

              {/* SMS Status */}
              <div className="bg-[#21263F] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span>📱</span>
                  <span className="text-white font-medium">SMS Service</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    serviceStatus.sms.configured 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {serviceStatus.sms.configured ? 'ใช้งานได้' : 'ยังไม่ตั้งค่า'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>🆔 Account SID: {serviceStatus.sms.hasAccountSid ? '✅' : '❌'}</p>
                  <p>🔑 Auth Token: {serviceStatus.sms.hasAuthToken ? '✅' : '❌'}</p>
                  <p>📞 Phone Number: {serviceStatus.sms.hasPhoneNumber ? '✅' : '❌'}</p>
                  <p>✅ Valid SID: {serviceStatus.sms.validAccountSid ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-[#070C1B] rounded-lg p-6 mb-6">
          <form onSubmit={handleTest} className="space-y-6">
            {/* Test Type Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                ประเภทการทดสอบ
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 bg-[#21263F] text-white rounded-lg border border-[--base-gray-100] focus:outline-none focus:border-[--brand-blue]"
              >
                <option value="email">Email เท่านั้น</option>
                <option value="sms">SMS เท่านั้น</option>
                <option value="all">ทุกประเภท (Email + SMS + In-App)</option>
              </select>
            </div>

            {/* Email Input */}
            {(testType === "email" || testType === "all") && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  required={testType === "email" || testType === "all"}
                  className="w-full px-3 py-2 bg-[#21263F] text-white rounded-lg border border-[--base-gray-100] focus:outline-none focus:border-[--brand-blue]"
                />
              </div>
            )}

            {/* Phone Input */}
            {(testType === "sms" || testType === "all") && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  📱 หมายเลขโทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812345678"
                  required={testType === "sms"}
                  className="w-full px-3 py-2 bg-[#21263F] text-white rounded-lg border border-[--base-gray-100] focus:outline-none focus:border-[--brand-blue]"
                />
                <p className="text-[--base-gray-400] text-xs mt-1">
                  รูปแบบ: 0812345678 หรือ +66812345678
                </p>
              </div>
            )}

            {/* Name Input */}
            {testType === "all" && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  👤 ชื่อผู้ใช้ (ทางเลือก)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="คุณทดสอบ"
                  className="w-full px-3 py-2 bg-[#21263F] text-white rounded-lg border border-[--base-gray-100] focus:outline-none focus:border-[--brand-blue]"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[--brand-blue] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังส่ง..." : "ทดสอบการส่งแจ้งเตือน"}
            </button>
          </form>
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-[#070C1B] rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">
              📊 ผลการทดสอบ
            </h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              results.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'
            }`}>
              <p className={`font-medium ${results.success ? 'text-green-400' : 'text-red-400'}`}>
                {results.message}
              </p>
            </div>

            {/* Detailed Results for "all" test */}
            {results.results && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">รายละเอียด:</h3>
                
                {/* Email Result */}
                {results.results.email.attempted && (
                  <div className="bg-[#21263F] p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>📧</span>
                      <span className="text-white font-medium">Email</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        results.results.email.success 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {results.results.email.success ? 'สำเร็จ' : 'ล้มเหลว'}
                      </span>
                    </div>
                    {results.results.email.error && (
                      <p className="text-red-400 text-sm">
                        ข้อผิดพลาด: {results.results.email.error}
                      </p>
                    )}
                  </div>
                )}

                {/* SMS Result */}
                {results.results.sms.attempted && (
                  <div className="bg-[#21263F] p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span>📱</span>
                      <span className="text-white font-medium">SMS</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        results.results.sms.success 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {results.results.sms.success ? 'สำเร็จ' : 'ล้มเหลว'}
                      </span>
                    </div>
                    {results.results.sms.error && (
                      <p className="text-red-400 text-sm">
                        ข้อผิดพลาด: {results.results.sms.error}
                      </p>
                    )}
                  </div>
                )}

                {/* Summary */}
                {results.results.summary && (
                  <div className="bg-[#21263F] p-3 rounded-lg">
                    <h4 className="text-white font-medium mb-2">สรุปผล:</h4>
                    <div className="text-sm text-[--base-gray-400] space-y-1">
                      <p>✅ สำเร็จ: {results.results.summary.totalSent}</p>
                      <p>❌ ล้มเหลว: {results.results.summary.totalFailed}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Single Test Results */}
            {results.messageId && (
              <div className="bg-[#21263F] p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2">รายละเอียด:</h4>
                <p className="text-[--base-gray-400] text-sm">
                  📧 Message ID: {results.messageId}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  ✅ ส่งสำเร็จแล้ว!
                </p>
              </div>
            )}

            {/* Error Details */}
            {results.error && (
              <div className="bg-[#21263F] p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2">ข้อผิดพลาด:</h4>
                <p className="text-red-400 text-sm">
                  {results.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-[#070C1B] rounded-lg p-6 mt-6">
          <h2 className="text-white text-lg font-semibold mb-3">
            ℹ️ ข้อมูลการทดสอบ
          </h2>
          <div className="text-[--base-gray-400] text-sm space-y-2">
            <p>• การทดสอบจะใช้ข้อมูลจำลองการยกเลิกการจอง</p>
            <p>• ตรวจสอบในโฟลเดอร์ Spam/Junk สำหรับ email</p>
            <p>• SMS จะส่งจาก Twilio service (ต้องมี credit)</p>
            <p>• การทดสอบ "ทุกประเภท" จะส่งแจ้งเตือนไปทุกช่องทางที่เปิดใช้งาน</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications; 