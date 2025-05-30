import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function CouponDiscount({ coupon , onRemove, onSelectCoupon }) {
  return (
    <div className=" h-[96px] flex flex-col gap-5 ">
      <div className="flex items-center justify-between pt-2">
        <span className="text-[--base-gray-300] text-base">Coupon</span>
        <button type="button" onClick={onSelectCoupon} className="text-[--base-gray-300] p-0 m-0 bg-transparent border-none outline-none">
          <ChevronRightIcon />
        </button>
      </div>
      <div className=" w-full h-[32px] bg-base-gray-100 rounded px-3 py-2 flex items-center justify-between body-2-regular text-base-gray-300 mt-[-12px] ">
        <span>{coupon}</span>
        <button className="ml-1 text-white" onClick={onRemove}>
          <CloseIcon 
          fontSize="small" 
          className="text-[--base-gray-300]"
          />
        </button>
      </div>
    </div>
  );
} 