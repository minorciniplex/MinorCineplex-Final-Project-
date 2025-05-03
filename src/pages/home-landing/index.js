import React from 'react';
import NavbarByCinema from "./sections/NavbarByCinema/NavbarByCinema";
import BannerByCinema from "./sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from '../../components/AnnouncementPopup';

const HomeLanding = () => {
  return (
    <main className="min-h-screen bg-[#0F1117]">
      <AnnouncementPopup />
      <NavbarByCinema />
      <BannerByCinema />
    </main>
  );
};

export default HomeLanding;
