import React from "react";

const ProfileAlert = ({ show, title, description, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="
        fixed left-4 bottom-12 z-[9999]
        md:left-auto md:right-4
        w-[343px] min-h-[80px]
        bg-[#00A372]/60
        rounded-[4px]
        shadow-lg
        backdrop-blur-[20px]
        flex items-center
        px-4 py-4
        gap-3
      "
      style={{
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex flex-col flex-1 gap-3">
        <span className="text-white font-bold text-base">{title}</span>
        <span className="text-white text-sm">{description}</span>
      </div>
      <button
        className="p-2 text-white text-xl font-bold hover:text-green-200"
        onClick={onClose}
        aria-label="close"
      >
        ✕
      </button>
    </div>
  );
};

export default ProfileAlert; 