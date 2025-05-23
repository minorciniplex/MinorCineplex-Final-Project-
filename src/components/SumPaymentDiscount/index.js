import Button from '../Button';

export default function SumPaymentDiscount({
  seats = [],
  paymentMethod = 'Credit card',
  coupon = null, // { label: '-THB50', color: 'text-brand-red' }
  total = '',
  onNext,
  disabled = false,
}) {
  return (
    <div className="bg-[#070C1B] w-screen max-w-none -mx-4 px-[16px] min-h-[228px]  pt-4 pb-6 flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Selected Seat</span>
          <span className="text-white body-1-medium">{Array.isArray(seats) ? seats.join(', ') : seats}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Payment method</span>
          <span className="text-white body-1-medium">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Coupon</span>
          <span className={coupon?.color || 'text-brand-red'}>{coupon?.label || '-'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base-gray-400 body-2-regular">Total</span>
          <span className="text-white body-1-medium">{total}</span>
        </div>
      </div>
      <Button
        className="!w-full !h-[48px] !rounded-[4px] self-center mt-4"
        onClick={onNext}
        disabled
        
      >
        Next
      </Button>
    </div>
  );
} 