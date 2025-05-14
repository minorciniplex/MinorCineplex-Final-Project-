import React, { useState } from 'react';
import Navbar from "@/components/Navbar/Navbar";
import BannerByCinema from "@/components/sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import FrameByCinema from "@/components/sections/FrameByCinema/FrameByCinema";
import FooterSection from '@/components/sections/FooterSection/FooterSection';

const HomeLanding = () => {
  const [filters, setFilters] = useState({
    movie: '',
    language: '',
    genre: '',
    city: '',
    releaseDate: ''
  });
  const [searchFilters, setSearchFilters] = useState(null);

  // รับค่าจาก BannerByCinema เมื่อกดค้นหา
  const handleSearch = (newFilters) => {
    setSearchFilters(newFilters);
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementPopup />
      <Navbar />
      <BannerByCinema />
      <FrameByCinema />
      <FooterSection />
    </main>
  );
};

export default HomeLanding;
