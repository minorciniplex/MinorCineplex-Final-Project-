import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function CouponDiscount({ coupon , onRemove, onSelectCoupon }) {
  console.log(coupon);
  return (
    <div className="bg-[#070C1B] w-[375px] h-[96px] md:w-[305px] md:h-[96px] flex flex-col gap-[20px] px-[16px] pt-[16px] pb-[16px] border-t border-b border-[#21263F]" style={{paddingRight: 16, paddingLeft: 16, paddingTop: 16, paddingBottom: 16}}>
      <div className="flex items-center justify-between">
        <span className="text-base-gray-400 body-2-regular">Coupon</span>
        <button type="button" onClick={onSelectCoupon} className="text-base-gray-400 p-0 m-0 bg-transparent border-none outline-none">
          <ChevronRightIcon />
        </button>
      </div>
      <div className="w-[343px] h-[32px] md:w-[273px] md:h-[32px] bg-base-gray-100 rounded px-3 py-2 flex items-center justify-between body-2-regular text-base-gray-300 mt-[-12px]">
        <span className="truncate w-full block">{coupon}</span>
        <button className="ml-1 mr-[-5px] text-white" onClick={onRemove}>
          <CloseIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
} 