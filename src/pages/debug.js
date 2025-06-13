import { useState } from 'react';
import axios from 'axios';

export default function DebugPage() {
  const [bookingId, setBookingId] = useState('d0c7783c-0b77-45a9-856a-5cfe58eb18f5');
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDebug = async () => {
    if (!bookingId.trim()) {
      setError('Please enter Booking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      const response = await axios.get(`/api/debug/booking-detail-debug?bookingId=${bookingId}`);
      setDebugData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      console.error('Debug error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C1B] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Booking Debug Tool</h1>
        
        <div className="bg-[#10162A] rounded-lg p-6 mb-6">
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 bg-[#1F2937] border border-gray-600 rounded-md text-white"
                placeholder="Enter Booking ID to check"
              />
            </div>
            <button
              onClick={handleDebug}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 rounded-md transition-colors"
            >
              {loading ? 'Checking...' : 'Debug'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-md p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {debugData && (
          <div className="bg-[#10162A] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Debug Results</h2>
            <pre className="bg-[#1F2937] p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 