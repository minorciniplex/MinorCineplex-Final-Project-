// Loading component สำหรับแสดงสถานะกำลังโหลด
export const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#181B29] bg-opacity-90">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-base-gray-200 border-t-brandblue-100 rounded-full animate-spin"></div>
        <p className="text-basewhite headline-3">Loading...</p>
      </div>
    </div>
  );
}; 