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
    <div className="bg-[#070C1B] w-full md:w-[305px] min-h-[228px] flex flex-col gap-[20px] px-[16px] pt-[16px] pb-[24px] border-t border-[#21263F] md:mb-[60px] mb-[60px] ">
      <div className="flex flex-col gap-[16px]">
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
        className="!w-full !h-[48px] !rounded-[4px] "
        onClick={onNext}
        disabled={disabled}
      >
        Next
      </Button>
    </div>
  );
} 