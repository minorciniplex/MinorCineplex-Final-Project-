import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentSuccess() {
  const [status, setStatus] = useState('loading');
  const router = useRouter();
  const { payment_intent_client_secret: clientSecret } = router.query;

  useEffect(() => {
    if (!clientSecret) {
      setStatus('error');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        switch (paymentIntent.status) {
          case 'succeeded':
            setStatus('success');
            break;
          case 'processing':
            setStatus('processing');
            break;
          case 'requires_payment_method':
            setStatus('failed');
            break;
          default:
            setStatus('error');
            break;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [clientSecret]);

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070C1B]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
            <h2 className="text-2xl font-bold mt-4 mb-2">กำลังตรวจสอบการชำระเงิน</h2>
            <p>กรุณารอสักครู่...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">ชำระเงินสำเร็จ</h2>
            <p>ขอบคุณที่ใช้บริการของเรา</p>
            <button
              onClick={handleBackToHome}
              className="mt-4 bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
            <p>ไม่สามารถตรวจสอบการชำระเงินได้</p>
            <button
              onClick={handleBackToHome}
              className="mt-4 bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">การชำระเงินไม่สำเร็จ</h2>
            <p>กรุณาลองใหม่อีกครั้ง</p>
            <button
              onClick={handleBackToHome}
              className="mt-4 bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 