import React, { useEffect } from "react";

export default function CouponAlert({ open, onClose, text, text_sub, type = 'success' }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const bgColor = type === 'error' ? 'bg-[#FF4B4B99]' : 'bg-[#00A37299]';

  return (
    <div className={`
      w-[90vw] max-w-[480px] h-[90px] 
      fixed bottom-4 right-1/2 translate-x-1/2
      md:bottom-8 md:right-20 md:translate-x-0
      ${bgColor} text-white px-4 py-3 md:px-8 md:py-4
      rounded-lg shadow-lg z-[9999] min-w-[220px] flex flex-col gap-1 font-sans animate-fadeInOut
    `}>
      <button
        className="absolute right-2 top-2 md:right-4 md:top-3 border-none text-white text-xl cursor-pointer"
        onClick={onClose}
      >
        &times;
      </button>
      <strong className="font-semibold">{text}</strong>
      <span className="text-sm">{text_sub}</span>
    </div>
  );
}
