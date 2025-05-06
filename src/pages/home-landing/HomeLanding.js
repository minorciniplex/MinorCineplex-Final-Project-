import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { BannerByCinema } from "./sections/BannerByCinema";
import { FrameByCinema } from "./sections/FrameByAnima/FrameByAnima";
import { NavbarByCinema } from "./sections/NavbarByCinema";

const HomeLandingDefault = () => {
  // Location permission options data
  const locationOptions = [
    "Allow while visiting the site",
    "Allow this time",
    "Never allow",
  ];

  return (
    <div className="relative w-full">
      <div className="w-full">
        <NavbarByCinema />
        <BannerByCinema />
        <Card className="flex flex-col w-[359px] items-start gap-2.5 p-6 absolute top-8 left-7 bg-[#1a1b20] rounded-2xl border-none">
          <CardContent className="flex flex-col items-center gap-6 relative self-stretch w-full p-0">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-white text-lg tracking-[0] leading-[23.4px]">
              www.minorcineplex.com <br />
              wants to
            </div>

            <div className="flex items-center relative self-stretch w-full">
              <img className="relative w-7 h-7" alt="Icon" src="/icon.svg" />
              <div className="relative w-[279px] [font-family:'Inter',Helvetica] font-medium text-[#c6c6cc] text-base tracking-[0] leading-[20.8px]">
                Know your location
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
              {locationOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="relative self-stretch w-full h-[50px] bg-[#323237] rounded-[100px] hover:bg-[#3a3a3f] text-[#a7b0b8]"
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
            >
              <XIcon className="w-6 h-6 text-white" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <FrameByCinema />

      <footer className="w-full h-[200px] bg-basegray-0 flex items-center justify-center">
        <div className="relative w-[188px] h-[85px]">
          <div className="relative w-[172px] h-[78px] top-[5px] left-[9px]">
            <div className="absolute w-[170px] h-[50px] top-0 left-0">
              <img
                className="w-[31px] h-[41px] left-[139px] absolute top-[9px]"
                alt="Vector"
                src="/vector-4.svg"
              />
              <img
                className="w-8 h-[41px] left-[103px] absolute top-[9px]"
                alt="Vector"
                src="/vector-3.svg"
              />
              <img
                className="w-[29px] h-[41px] left-[67px] absolute top-[9px]"
                alt="Vector"
                src="/vector-5.svg"
              />
              <img
                className="w-2.5 h-[41px] left-[50px] absolute top-[9px]"
                alt="Vector"
                src="/vector.svg"
              />
              <div className="absolute w-[43px] h-[50px] top-0 left-0">
                <img
                  className="w-[43px] h-[42px] left-0 absolute top-[9px]"
                  alt="Vector"
                  src="/vector-1.svg"
                />
                <img
                  className="absolute w-3 h-[9px] top-0 left-4"
                  alt="Polygon"
                  src="/polygon-1.svg"
                />
              </div>
            </div>
            <div className="absolute top-[54px] left-0 [font-family:'Roboto_Condensed',Helvetica] font-normal text-white text-base text-center tracking-[5.60px] leading-6 whitespace-nowrap">
              C I N E P L E X
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeLandingDefault;
