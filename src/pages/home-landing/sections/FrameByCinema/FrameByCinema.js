import { Star as StarFillIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "../../../../components/ui/badge";
import Button from "../../../../components/Button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { coupons } from "@/data/coupons";
import { cinemasByCity } from "@/data/cinemas";
import CouponCard from "@/components/Coupon/CouponCard";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { supabase } from "@/utils/supabase";

const FrameByCinema = () => {
  const sectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState("now-showing");
  const [viewMode, setViewMode] = useState("browse-by-city");
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);

  useEffect(() => {
    async function fetchMovies() {
      const today = new Date().toISOString().split('T')[0];
      // Now showing
      let { data: nowShowing } = await supabase
        .from('movies')
        .select('*')
        .lte('release_date', today)
        .order('release_date', { ascending: true });
      setNowShowingMovies(nowShowing || []);
      // Coming soon
      let { data: comingSoon } = await supabase
        .from('movies')
        .select('*')
        .gt('release_date', today)
        .order('release_date', { ascending: true });
      setComingSoonMovies(comingSoon || []);
    }
    fetchMovies();
  }, []);

  const totalMovies = activeTab === "now-showing" ? nowShowingMovies.length : comingSoonMovies.length;
  const totalPages = Math.ceil(totalMovies / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the section
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // สร้างปุ่มเลขหน้า
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // จำนวนปุ่มที่จะแสดง (ไม่รวม ... และปุ่มก่อนหน้า/ถัดไป)

    if (totalPages <= maxVisiblePages) {
      // ถ้ามีหน้าน้อยกว่าหรือเท่ากับ maxVisiblePages ให้แสดงทั้งหมด
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center ${currentPage === i
              ? "bg-base-gray-200 text-basewhite rounded"
              : "text-base-gray-300 hover:text-basewhite"
              }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // แสดงปุ่มแบบมี ...
      if (currentPage <= 3) {
        // กรณีอยู่หน้าต้นๆ
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-8 h-8 flex items-center justify-center ${currentPage === i
                ? "bg-base-gray-200 text-basewhite rounded"
                : "text-base-gray-300 hover:text-basewhite"
                }`}
            >
              {i}
            </button>
          );
        }
        pages.push(<span key="dots1" className="text-base-gray-300">...</span>);
        pages.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
          >
            {totalPages}
          </button>
        );
      } else if (currentPage >= totalPages - 2) {
        // กรณีอยู่หน้าท้ายๆ
        pages.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
          >
            1
          </button>
        );
        pages.push(<span key="dots2" className="text-base-gray-300">...</span>);
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-8 h-8 flex items-center justify-center ${currentPage === i
                ? "bg-base-gray-200 text-basewhite rounded"
                : "text-base-gray-300 hover:text-basewhite"
                }`}
            >
              {i}
            </button>
          );
        }
      } else {
        // กรณีอยู่หน้ากลางๆ
        pages.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
          >
            1
          </button>
        );
        pages.push(<span key="dots1" className="text-base-gray-300">...</span>);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-8 h-8 flex items-center justify-center ${currentPage === i
                ? "bg-base-gray-200 text-basewhite rounded"
                : "text-base-gray-300 hover:text-basewhite"
                }`}
            >
              {i}
            </button>
          );
        }
        pages.push(<span key="dots2" className="text-base-gray-300">...</span>);
        pages.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
          >
            {totalPages}
          </button>
        );
      }
    }
    return pages;
  };

  // เมื่อเปลี่ยน tab ให้กลับไปหน้า 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <section ref={sectionRef} className="flex flex-col w-full mt-[180px] md:mt-20">
      {/* Now Showing Section */}
      <div className="flex flex-col items-center gap-4 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
        <div className="flex flex-row items-center gap-6 w-full">
          <button
            onClick={() => setActiveTab("now-showing")}
            className={`pb-1 transition-all duration-500 ease-in-out font-bold text-lg md:text-2xl ${activeTab === "now-showing" ? "text-white border-b-2 border-base-gray-200" : "text-base-gray-400"}`}
          >
            Now showing
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`pb-1 transition-all duration-500 ease-in-out font-bold text-lg md:text-2xl ${activeTab === "coming-soon" ? "text-white border-b-2 border-base-gray-200" : "text-base-gray-400"}`}
          >
            Coming soon
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {(activeTab === "now-showing"
            ? nowShowingMovies
            : comingSoonMovies
          )?.slice(startIndex, endIndex).map((movie) => (
            <div key={movie.movie_id || movie.id} className="flex flex-col items-start gap-3 md:gap-4 group cursor-pointer">
              <div
                className="w-[150px] h-[225px] md:w-[285px] md:h-[416px] rounded-[8px] bg-cover bg-center shadow-md mx-auto transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${movie.poster_url || movie.poster})` }}
              />

              <div className="flex flex-col items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="text-base-gray-300 body-2-regular flex items-center">
                    {movie.release_date || movie.date}
                  </span>
                  <div className="flex items-center">
                    <StarFillIcon className="w-4 h-4 fill-[#4E7BEE] text-[#4E7BEE]" />
                    <span className="text-base-gray-300 body-2-regular ml-1 flex items-center">
                      {movie.rating}
                    </span>
                  </div>
                </div>

                <h3 className="text-basewhite font-bold truncate max-w-full md:headline-4 group-hover:text-brandblue-100 transition-colors duration-200">
                  {movie.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-start gap-2">
                {(() => {
                  let genres = movie.genres;
                  if (typeof genres === "string") {
                    genres = genres
                      .replace(/[{}]/g, '')
                      .split(',')
                      .map(s => s.replace(/"/g, '').trim())
                      .filter(Boolean);
                  }
                  return Array.isArray(genres) && genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular text-[length:var(--body-2-regular-font-size)] leading-[var(--body-2-regular-line-height)] tracking-[var(--body-2-regular-letter-spacing)] [font-style:var(--body-2-regular-font-style)] rounded "
                    >
                      {genre}
                    </span>
                  ));
                })()}
                {/* Language Badge */}
                {(() => {
                  // Mapping ภาษาเป็นตัวย่อมาตรฐาน
                  const langMap = {
                    English: 'EN',
                    Thai: 'TH',
                    Japan: 'JP',
                    Japanese: 'JP',
                    Chinese: 'CN',
                    Mandarin: 'CN',
                    Korean: 'KR',
                    French: 'FR',
                    German: 'DE',
                    Spanish: 'ES',
                    Italian: 'IT',
                    Russian: 'RU',
                    Arabic: 'AR',
                    Hindi: 'HI',
                    Vietnamese: 'VI',
                    Malay: 'MY',
                    Indonesian: 'ID',
                    Filipino: 'PH',
                  };
                  const orig = movie.original_language;
                  const origShort = langMap[orig] || (orig ? orig.slice(0,2).toUpperCase() : null);
                  const subs = Array.isArray(movie.subtitle_languages) ? movie.subtitle_languages : [];
                  const badgeClass = "flex justify-center items-center min-w-[41px] min-h-[32px] px-2 py-1 bg-base-gray-100 text-base-gray-400 font-medium rounded-md";
                  // ถ้า original เป็น EN และ subs มี TH
                  if (origShort === 'EN' && subs.includes('Thai')) {
                    return <span className={badgeClass}>TH/EN</span>;
                  }
                  // ถ้า original เป็น TH และ subs มี EN
                  if (origShort === 'TH' && subs.includes('English')) {
                    return <span className={badgeClass}>EN/TH</span>;
                  }
                  // ถ้า original เป็นภาษาอื่น
                  if (origShort) {
                    return <span className={badgeClass}>{origShort}</span>;
                  }
                  return null;
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 pagination mt-5 md:mt-5">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            className="w-8 h-8 flex items-center justify-center text-base-gray-300 hover:text-basewhite"
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Special Coupons Section */}
      <div className="flex flex-col items-center gap-4 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between w-full flex-row gap-2 md:gap-0 mb-2">
          <h2 className="headline-2 md:headline-2 ">Special coupons</h2>
          <button className="text-basewhite underline body-1-medium md:body-1-medium p-0 hover:text-brandblue-100 transition-colors duration-200 whitespace-nowrap">View all</button>
        </div>

        <div className="grid grid-cols-2 mt-4 md:mt-0 md:grid-cols-4 gap-4 md:gap-5 w-full">
          {coupons.slice(0, 4).map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>

      {/* All Cinemas Section */}
      <div className="flex flex-col items-center gap-4 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3 md:gap-0">
          <h2 className="text-base-white headline-2 text-left pl-0 md: prose-headline-2 ">All cinemas</h2>

          <div className="w-full h-[44px] flex gap-1 bg-base-gray-100 rounded-[4px] p-1 mt-2 md:w-[380px] md:h-[48px] md:mt-0">
            <button
              className={`flex-1 flex items-center justify-center gap-1 px-0 py-2 rounded-[4px] font-bold transition text-xs md:text-base h-full ${viewMode === "browse-by-city"
                  ? "bg-[#434665] text-white shadow"
                  : "bg-transparent text-[#8B93B0] hover:bg-[#35385a]"
                }`}
              onClick={() => setViewMode("browse-by-city")}
            >
              {viewMode === "browse-by-city" && (
                <svg className="w-4 h-4 text-brandblue-100" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Browse by City
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1 px-0 py-2 rounded-[4px] font-bold transition text-xs md:text-base h-full ${viewMode === "nearest-locations"
                  ? "bg-[#434665] text-white shadow"
                  : "bg-transparent text-[#8B93B0] hover:bg-[#35385a]"
                }`}
              onClick={() => setViewMode("nearest-locations")}
            >
              {viewMode === "nearest-locations" && (
                <svg className="w-4 h-4 text-brandblue-100" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Nearest Locations First
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 md:gap-6 w-full">
          {cinemasByCity.map((cityGroup, index) => (
            <div key={index} className="flex flex-col items-start gap-6 w-full">
              <h3 className="text-base-gray-300 headline-3 text-base md:headline-3 tracking-[var(--headline-3-letter-spacing)] leading-[var(--headline-3-line-height)] [font-style:var(--headline-3-font-style)]">
                {cityGroup.city}
              </h3>

              <div className="flex flex-col gap-4 md:flex-wrap md:flex-row md:gap-5 w-full">
                {cityGroup.cinemas.map((cinema) => (
                  <div
                    key={cinema.id}
                    className="w-full h-[120px] max-w-[344px] mx-auto  p-4 border border-base-gray-100 rounded-[4px] flex items-center gap-4 mb-2 md:mb-0 md:p-4 md:rounded-[4px] md:bg-transparent md:max-w-[590px] md:border md:border-base-gray-100 cursor-pointer hover:border-brandblue-100 transition-colors duration-200 group md:mx-0"
                  >
                    <div className="w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-full bg-[#21263F]">
                      <FmdGoodIcon style={{ color: '#4E7BEE', fontSize: 20 }} />
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1 flex-1">
                      <h4 className="text-basewhite headline-3 md:headline-3 group-hover:text-brandblue-100 transition-colors duration-200">
                        {cinema.name}
                      </h4>
                      <p className=" body-2-regular text-base-gray-300 text-sm md:body-2-regular">
                        {cinema.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrameByCinema;