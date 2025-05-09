import { useState, useEffect } from 'react';
import { XIcon } from "lucide-react";
import Button from "./Button";
import { Card, CardContent } from "./ui/card";
import FmdGoodIcon from '@mui/icons-material/FmdGood';

const AnnouncementPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  const locationOptions = [
    "Allow while visiting the site",
    "Allow this time",
    "Never allow",
  ];

  useEffect(() => {
    // ตรวจสอบว่าเคยเห็น popup หรือยัง
    const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement');
    if (!hasSeenAnnouncement) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenAnnouncement', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Card className="absolute top-8 left-7 w-[359px] h-[336px] bg-[#1a1b20] rounded-2xl border-none pointer-events-auto">
        <CardContent className="flex flex-col items-start gap-4 p-4 h-full">
          {/* Header Section */}
          <div className="flex items-start justify-between w-full pt-1">
            <div className="flex flex-col gap-0.5">
              <div className="text-white text-lg font-medium font-['Inter']">
                www.minorcineplex.com
              </div>
              <div className="text-white text-lg font-medium font-['Inter']">
                wants to
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-[#C8CEDD] hover:text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Location Icon & Text */}
          <div className="flex items-center gap-2">
            <FmdGoodIcon className="text-[#C6C6CC] w-6 h-6" />
            <span className="text-[#C6C6CC] text-base font-medium">
              Know your location
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 w-full">
            {locationOptions.map((option, index) => (
              <button
                key={index}
                onClick={handleClose}
                className="w-full py-3.5 px-4 bg-[#323237] hover:bg-[#3a3a3f] rounded-full text-[#C6C6CC] text-base font-medium transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementPopup; 