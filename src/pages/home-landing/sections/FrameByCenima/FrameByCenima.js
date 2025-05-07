import { Star as StarFillIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "../../../../components/ui/badge";
import Button from "../../../../components/Button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { nowShowingMovies, comingSoonMovies } from "@/data/movies";
import { coupons } from "@/data/coupons";
import { cinemasByCity } from "@/data/cinemas";
import CouponCard from "@/components/Coupon/CouponCard";
import FmdGoodIcon from '@mui/icons-material/FmdGood';

export const FrameByCinema = () => {
  const sectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState("now-showing");
  const [viewMode, setViewMode] = useState("browse-by-city");
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;

  // คำนวณจำนวนหน้าทั้งหมด
  const totalMovies = activeTab === "now-showing" ? nowShowingMovies.length : comingSoonMovies.length;
  const totalPages = Math.ceil(totalMovies / moviesPerPage);

  // คำนวณ index เริ่มต้นและสิ้นสุดของหนังที่จะแสดง
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
    <section ref={sectionRef} className="flex flex-col w-full mt-20">
      {/* Now Showing Section */}
      <div className="flex flex-col items-center gap-10 px-[120px] py-20 w-full max-w-[1440px] mx-auto">
        <div className="flex gap-4 w-full">
          <button
            onClick={() => setActiveTab("now-showing")}
            className={`flex flex-col items-start p-1 transition-all duration-500 ease-in-out hover:text-basewhite ${activeTab === "now-showing"
              ? "text-basewhite border-b-2 border-base-gray-200"
              : "text-base-gray-300"
              } text-2xl font-bold`}
          >
            <span>Now showing</span>
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`flex flex-col items-start px-2 py-1 transition-all duration-500 ease-in-out hover:text-basewhite ${activeTab === "coming-soon"
              ? "text-basewhite border-b-2 border-base-gray-200"
              : "text-base-gray-300"
              } text-2xl font-bold`}
          >
            <span>Coming soon</span>
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTab === "now-showing"
            ? nowShowingMovies.slice(startIndex, endIndex).map((movie) => (
              <div key={movie.id} className="flex flex-col items-start gap-4 group cursor-pointer">
                <div
                  className="w-[285px] h-[416px] rounded bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${movie.poster})` }}
                />

                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base-gray-300 body-2-regular flex items-center">
                      {movie.date}
                    </span>
                    <div className="flex items-center">
                      <StarFillIcon className="w-4 h-4 fill-[#4E7BEE] text-[#4E7BEE]" />
                      <span className="text-base-gray-300 body-2-regular ml-1 flex items-center">
                        {movie.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-basewhite headline-4 font-bold group-hover:text-brandblue-100 transition-colors duration-200 truncate max-w-[285px]">
                    {movie.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular text-[length:var(--body-2-regular-font-size)] leading-[var(--body-2-regular-line-height)] tracking-[var(--body-2-regular-letter-spacing)] [font-style:var(--body-2-regular-font-style)] rounded "
                    >
                      {genre}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular text-[length:var(--body-2-medium-font-size)] leading-[var(--body-2-medium-line-height)] tracking-[var(--body-2-medium-letter-spacing)] [font-style:var(--body-2-medium-font-style)] rounded ">
                    {movie.language}
                  </span>
                </div>
              </div>
            ))
            : comingSoonMovies.slice(startIndex, endIndex).map((movie) => (
              <div key={movie.id} className="flex flex-col items-start gap-4 group cursor-pointer">
                <div
                  className="w-[285px] h-[416px] rounded bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${movie.poster})` }}
                />

                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base-gray-300 body-2-regular flex items-center">
                      {movie.date}
                    </span>
                    <div className="flex items-center">
                      <StarFillIcon className="w-4 h-4 fill-[#4E7BEE] text-[#4E7BEE]" />
                      <span className="text-base-gray-300 body-2-regular ml-1 flex items-center">
                        {movie.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-basewhite headline-4 font-bold group-hover:text-brandblue-100 transition-colors duration-200 truncate max-w-[285px]">
                    {movie.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular text-[length:var(--body-2-regular-font-size)] leading-[var(--body-2-regular-line-height)] tracking-[var(--body-2-regular-letter-spacing)] [font-style:var(--body-2-regular-font-style)] rounded "
                    >
                      {genre}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular text-[length:var(--body-2-medium-font-size)] leading-[var(--body-2-medium-line-height)] tracking-[var(--body-2-medium-letter-spacing)] [font-style:var(--body-2-medium-font-style)] rounded ">
                    {movie.language}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 pagination">
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
      <div className="flex flex-col items-center gap-10 px-[120px] py-20 w-full max-w-[1440px] mx-auto">
        <div className="flex items-baseline justify-between w-full">
          <h2 className="text-basewhite headline-2 text-[length:var(--headline-2-font-size)] leading-[var(--headline-2-line-height)] tracking-[var(--headline-2-letter-spacing)] [font-style:var(--headline-2-font-style)]">
            Special coupons
          </h2>

          <button className="text-basewhite body-1-medium text-base leading-6 underline [font-family:'Roboto_Condensed',Helvetica] p-0 hover:text-brandblue-100 transition-colors duration-200">
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {coupons.slice(0, 4).map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>

      {/* All Cinemas Section */}
      <div className="flex flex-col items-center gap-10 px-[120px] py-20 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-basewhite headline-2 ">
            All cinemas
          </h2>

          <div className="w-[380px] h-[48px] flex gap-2 bg-base-gray-100 rounded-[4px] p-[4px]">
            <button
              className={`flex items-center gap-2 px-6 py-2 rounded-[4px] font-bold transition ${viewMode === "browse-by-city"
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
              className={`flex items-center gap-2 px-6 py-2 rounded-[4px] font-bold transition ${viewMode === "nearest-locations"
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

        <div className="flex flex-col items-center gap-10 w-full">
          {cinemasByCity.map((cityGroup, index) => (
            <div key={index} className="flex flex-col items-start gap-6 w-full">
              <h3 className="text-base-gray-300 headline-3 text-[length:var(--headline-3-font-size)] tracking-[var(--headline-3-letter-spacing)] leading-[var(--headline-3-line-height)] [font-style:var(--headline-3-font-style)]">
                {cityGroup.city}
              </h3>

              <div className="flex flex-wrap gap-5 w-full">
                {cityGroup.cinemas.map((cinema) => (
                  <div
                    key={cinema.id}
                    className="flex items-center gap-4 p-4 w-full max-w-[590px] min-h-[90px] bg-transparent border border-base-gray-100 rounded-[4px] cursor-pointer hover:border-brandblue-100 transition-colors duration-200 group"
                  >
                    <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#21263F]">
                      <FmdGoodIcon style={{ color: '#4E7BEE', fontSize: 24 }} />
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1 flex-1">
                      <h4 className="text-basewhite  headline-3  group-hover:text-brandblue-100 transition-colors duration-200">
                        {cinema.name}
                      </h4>
                      <p className="text-base-gray-300 text-body-2-regular">
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

