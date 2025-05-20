import { useState, useEffect } from 'react';
import { XIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import FmdGoodIcon from '@mui/icons-material/FmdGood';

const AnnouncementPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement');
    if (hasSeenAnnouncement === 'true') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleAllowLocation = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenAnnouncement', 'true');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // สามารถนำตำแหน่งไปใช้งานต่อได้ที่นี่
          // ตัวอย่าง: console.log(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // handle error ได้ที่นี่ (ถ้าต้องการ)
        }
      );
    }
  };

  const handleNeverAllow = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenAnnouncement', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenAnnouncement', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <Card className="absolute top-4 left-1/2 -translate-x-1/2 w-[90vw] max-w-[360px] h-auto max-h-[90vh] bg-[#1a1b20] rounded-2xl border-none pointer-events-auto md:top-8 md:left-8 md:translate-x-0 md:w-[359px] md:h-[336px] md:max-w-none">
        <CardContent className="flex flex-col items-start gap-4 p-4 h-full">
          {/* Header Section */}
          <div className="flex items-start justify-between w-full pt-1">
            <div className="flex flex-col gap-0.5">
              <div className="text-white text-lg font-medium font-['Inter']">
                www.minorcineplex.comb
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
            <button
              onClick={handleAllowLocation}
              className="w-full py-3.5 px-4 bg-[#323237] hover:bg-[#3a3a3f] rounded-full text-[#C6C6CC] text-base font-medium transition-colors"
            >
              Allow while visiting the site
            </button>
            <button
              onClick={handleAllowLocation}
              className="w-full py-3.5 px-4 bg-[#323237] hover:bg-[#3a3a3f] rounded-full text-[#C6C6CC] text-base font-medium transition-colors"
            >
              Allow this time
            </button>
            <button
              onClick={handleNeverAllow}
              className="w-full py-3.5 px-4 bg-[#323237] hover:bg-[#3a3a3f] rounded-full text-[#C6C6CC] text-base font-medium transition-colors"
            >
              Never allow
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementPopup; 