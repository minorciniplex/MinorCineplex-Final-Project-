import React, { useState } from 'react';
import NavbarByCinema from "./sections/NavbarByCinema/NavbarByCinema";
import BannerByCinema from "./sections/BannerByCinema/BannerByCinema";
import AnnouncementPopup from "../../components/AnnouncementPopup";
import FrameByCinema from "./sections/FrameByCinema/FrameByCinema";
import FooterSection from "./sections/FooterSection/FooterSection";
import Head from 'next/head';
import Navbar from '@/components/Navbar/Navbar';

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
      <NavbarByCinema />
      <BannerByCinema onSearch={handleSearch} />
      <FrameByCinema filters={searchFilters} />
      <FooterSection />
    </main>
  );
};

export default HomeLanding;
