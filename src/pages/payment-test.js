import PaymentForm from '@/components/PaymentSystem/PaymentForm';

export default function PaymentTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <PaymentForm amount={100} onSuccess={() => alert('ชำระเงินสำเร็จ!')} />
    </div>
  );
}