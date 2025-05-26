import React, { useState } from 'react';
import Navbar from "@/components/Navbar/Navbar";
import BannerByCinema from "@/components/sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import FrameByCinemaWithBoundary from "@/components/sections/FrameByCinema/FrameByCinema";
import FooterSection from '@/components/sections/FooterSection/FooterSection';
import ScrollToTop from '@/components/ScrollToTop';


const HomeLanding = () => {
  const [filters, setFilters] = useState({
    movie: '',
    language: '',
    genre: '',
    city: '',
    releaseDate: ''
  });
  const [searchFilters, setSearchFilters] = useState({});

  // รับค่าจาก BannerByCinema เมื่อกดค้นหา
  const handleSearch = (newFilters) => {
    setSearchFilters(newFilters);
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementPopup />
      <Navbar />
      <BannerByCinema onSearch={handleSearch} />
      <FrameByCinemaWithBoundary filters={searchFilters} />
      <FooterSection />
      <ScrollToTop />
    </main>
  );
};

export default HomeLanding;
