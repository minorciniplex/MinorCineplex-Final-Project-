import React from 'react';
import NavbarByCinema from "./sections/NavbarByCinema/NavbarByCinema";
import BannerByCinema from "./sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from '../../components/AnnouncementPopup';
import { FrameByCinema } from "./sections/FrameByCenima/FrameByCenima";

const HomeLanding = () => {
  return (
    <main className="min-h-screen bg-background">
      <AnnouncementPopup />
      <NavbarByCinema />
      <BannerByCinema />
      <FrameByCinema />
    </main>
  );
};

export default HomeLanding;
