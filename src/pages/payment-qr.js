import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentQR() {
  const router = useRouter();
  const { chargeId, amount, bookingId } = router.query;
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!chargeId) return;
    fetch(`/api/get-qr?chargeId=${chargeId}`)
      .then(res => res.json())
      .then(data => setQr(data.qr));
  }, [chargeId]);

  // Poll สถานะ Omise charge ทุก 5 วินาที
  useEffect(() => {
    if (!chargeId || !bookingId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/get-qr-status?chargeId=${chargeId}`);
      const data = await res.json();
      setStatus(data.status);
      if (data.status === 'successful' || data.status === 'paid') {
        clearInterval(interval);
        router.replace(`/payment-success?bookingId=${bookingId}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chargeId, bookingId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181C2A] text-white">
      <div className="bg-[#232B47] rounded-xl py-10 px-8 flex flex-col items-center justify-center w-full max-w-md mt-8">
        <div className="mb-4 text-base-gray-200 text-center">Time remaining: <span className="text-brand-blue-200 font-bold">04:55</span></div>
        {qr && (
          <img src={qr} alt="PromptPay QR" width={220} height={220} className="mx-auto" />
        )}
        <div className="mt-6 text-white font-bold text-lg text-center">Minor Cineplex Public limited company</div>
        <div className="mt-2 text-white font-bold text-2xl text-center">THB{amount}</div>
        {status && <div className="mt-4 text-white">สถานะ: {status}</div>}
      </div>
    </div>
  );
} 