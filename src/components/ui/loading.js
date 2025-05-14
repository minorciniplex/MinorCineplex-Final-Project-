import React, { useState, useEffect } from "react";

// Loading component สำหรับแสดงสถานะกำลังโหลด
export const Loading = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000); // 4 วินาที
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#181B29] bg-opacity-90">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/assets/popcorn-svgrepo-com.svg"
          alt="Loading"
          className="w-24 h-24 animate-spin"
          style={{ animationDuration: '2s' }} // หมุนช้าลง
        />
        <p className="text-basewhite headline-3">Loading...</p>
      </div>
    </div>
  );
}; 