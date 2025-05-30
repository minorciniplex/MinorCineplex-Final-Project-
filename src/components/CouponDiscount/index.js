import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function CouponDiscount({ coupon = "Merry March Magic – Get 50 THB Off! (Only in March)", onRemove, onSelectCoupon }) {
  return (
    <div className="bg-[#070C1B] h-[96px] w-screen max-w-none -mx-4 px-[16px] border-y border-[#21263F] pt-4 pb-4 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-base-gray-400 body-2-regular">Coupon</span>
        <button type="button" onClick={onSelectCoupon} className="text-base-gray-400 p-0 m-0 bg-transparent border-none outline-none">
          <ChevronRightIcon />
        </button>
      </div>
      <div className=" w-[343px] h-[32px] bg-base-gray-100 rounded px-3 py-2 flex items-center justify-between body-2-regular text-base-gray-300 mt-[-12px]">
        <span>{coupon}</span>
        <button className="ml-1 mr-[-5px] text-white" onClick={onRemove}>
          <CloseIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
} 