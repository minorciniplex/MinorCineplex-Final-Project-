import { useState, useEffect } from 'react';
import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
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
      <Card className="absolute top-8 left-7 flex flex-col w-[359px] h-[336px] items-start gap-2.5 p-6 bg-[#1a1b20] rounded-2xl border-none pointer-events-auto">
        <CardContent className="flex flex-col items-center gap-6 relative self-stretch w-full p-0">
          <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-white text-lg tracking-[0] leading-[23.4px]">
            www.minorcineplex.com <br />
            wants to
          </div>

          <div className="flex items-center relative self-stretch w-full">
            <FmdGoodIcon className="text-[#C6C6CC] w-[28px] h-[28px mr-[5px]" />
            <div className="relative w-[279px] [font-family:'Inter',Helvetica] font-medium text-[#C6C6CC] text-base tracking-[0] leading-[20.8px]">
              Know your location
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
            {locationOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="relative self-stretch w-full h-[50px] bg-[#323237] rounded-[100px] hover:bg-[#3a3a3f] text-[#A7B1B8]"
                onClick={handleClose}
              >
                <span className="[font-family:'Inter',Helvetica] font-medium text-base text-center tracking-[0] leading-[20.8px]">
                  {option}
                </span>
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute w-6 h-6 top-0 right-0 p-0"
            onClick={handleClose}
          >
            <XIcon className="w-6 h-6 text-[#C8CEDD]" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementPopup; 