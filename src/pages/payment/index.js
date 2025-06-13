import PaymentMobile from '../../components/Coupon-PaymentCard/CouponApply';
import { PaymentProvider } from '@/context/PaymentContext';

export default function PaymentPage() {
  return (
    <PaymentProvider>
      <PaymentMobile />
    </PaymentProvider>
  );
}