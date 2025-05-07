import React from "react";
import { BannerByCinema } from "./sections/BannerByCinema";
import { FrameByCinema } from "./sections/FrameByAnima/FrameByAnima";
import { NavbarByCinema } from "./sections/NavbarByCinema";
import FooterSection from "./sections/FooterSection/FooterSection";

const HomeLandingDefault = () => {
  return (
    <div className="relative w-full">
      <div className="w-full">
        <NavbarByCinema />
        <BannerByCinema />
      </div>
      <FrameByCinema />
      <FooterSection />
    </div>
  );
};

export default HomeLandingDefault;