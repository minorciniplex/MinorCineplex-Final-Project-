import React, { useState } from 'react';
import Image from 'next/image';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '../Button';

export default function CouponSelectPopup({ open, coupons = [], onClose, onApply }) {
  const [selected, setSelected] = useState(null);
  const mockCoupons = [
    {
      id: 1,
      image: '/assets/images/coupon-image-7.png',
      description: 'Merry March Magic – Get 50 THB Off! (Only in March)',
      expired_at: '18 Jun 2025',
    },
    {
      id: 2,
      image: '/assets/images/coupon-image-7.png',
      description: 'Minor Cineplex x COKE JOYFUL TOGETHER PACKAGE: Great Deal for Only 999 THB!',
      expired_at: '18 Jun 2025',
    },
    {
      id: 3,
      image: '/assets/images/coupon-image-7.png',
      description: 'Merry March Magic – Get 50 THB Off! (Only in March)',
      expired_at: '18 Jun 2025',
    },
    {
      id: 4,
      image: '/assets/images/coupon-image-7.png',
      description: 'Merry March Magic – Get 50 THB Off! (Only in March)',
      expired_at: '18 Jun 2025',
    },

 
  ];
  const couponsToShow = coupons && coupons.length > 0 ? coupons : mockCoupons;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#21263F] rounded-[8px] w-[95vw] max-w-[420px] h-auto min-h-[420px] border border-[#565F7E] shadow-[0_4px_30px_4px_rgba(0,0,0,0.5)] p-4 md:p-8 text-white flex flex-col mx-2 md:w-[1050px] md:h-[558px] md:max-w-none">
        <div className="flex justify-center items-center mb-4 md:mb-6 relative">
          <span className="headline-3 text-center w-full">Select coupon</span>
          <button onClick={onClose} className="text-white headline-3 absolute right-0 top-1/2 -translate-y-1/2">×</button>
        </div>
        <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto overflow-x-hidden flex-1 md:grid-cols-2 md:gap-4 md:max-h-[370px] md:pr-6">
          {couponsToShow.length === 0 && (
            <div className="text-base-gray-300 text-center py-8 col-span-1 md:col-span-2">No coupons</div>
          )}
          {couponsToShow.map(coupon => {
            const maxWords = 5;
            const words = coupon.description.split(' ');
            const displayText = words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : coupon.description;
            return (
              <div
                key={coupon.id}
                className={`rounded-[8px] flex items-center gap-0 cursor-pointer border ${selected?.id === coupon.id ? 'border-white bg-[#565F7E]' : 'border-transparent bg-[#232B47]'} w-full h-[96px] overflow-hidden md:w-[464px] md:h-[174px]`}
                onClick={() => setSelected(coupon)}
              >
                <Image
                  src={coupon.image}
                  alt="coupon"
                  width={96}
                  height={96}
                  className="object-cover rounded-l-[8px] h-full w-[96px] md:w-[174px] md:h-full"
                  style={{margin: 0, padding: 0, border: 'none'}}
                />
                <div className="flex-1 flex flex-col justify-between h-full pl-2 py-2 md:pl-3 md:py-4">
                  <div>
                    <div
                      className="text-white body-1-medium text-base mb-1 truncate md:line-clamp-2 md:whitespace-normal md:text-lg md:mb-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      <span className="block md:hidden">{displayText}</span>
                      <span className="hidden md:block">{coupon.description}</span>
                    </div>
                    <div className="body-2-regular text-base-gray-300 mb-1">
                      Valid until <span className="text-white">{coupon.expired_at}</span>
                    </div>
                  </div>
                  <button className="text-white underline underline-offset-4 underline-ns body-1-medium flex items-center gap-1 w-fit mt-[-2px] md:mt-[-4px] ">
                    View details <ChevronRightIcon fontSize="medium" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-4 mt-6 md:mt-8">
          <Button className='!rounded-[4px] !min-w-[147.5px] md:min-w-[160px] !py-2 md:!py-3' variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button className='!rounded-[4px] !min-w-[147.5px] md:min-w-[160px] !py-2 md:!py-3' variant="primary" onClick={() => selected && onApply(selected)} disabled={!selected}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
} 