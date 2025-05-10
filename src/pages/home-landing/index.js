import React from "react";
import NavbarByCinema from "./sections/NavbarByCinema/NavbarByCinema";
import BannerByCinema from "./sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from "../../components/AnnouncementPopup";
import FrameByCinema from "./sections/FrameByCinema/FrameByCinema";
import FooterSection from "./sections/FooterSection/FooterSection";

const HomeLanding = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementPopup />
      <NavbarByCinema />
      <BannerByCinema />
      <FrameByCinema />
      <FooterSection />
    </main>
  );
};

export default HomeLanding;
