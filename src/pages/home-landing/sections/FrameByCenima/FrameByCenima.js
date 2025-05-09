import { Star as StarFillIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "../../../../components/ui/badge";
import Button from "../../../../components/Button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { nowShowingMovies, comingSoonMovies } from "@/data/movies";
import { coupons } from "@/data/coupons";

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
            className={`w-8 h-8 flex items-center justify-center ${
              currentPage === i
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
              className={`w-8 h-8 flex items-center justify-center ${
                currentPage === i
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
              className={`w-8 h-8 flex items-center justify-center ${
                currentPage === i
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
              className={`w-8 h-8 flex items-center justify-center ${
                currentPage === i
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

  // Cinema data
  const cinemasByCity = [
    {
      city: "Bangkok",
      cinemas: [
        {
          id: 1,
          name: "Minor Cineplex Arkham",
          address: "1224 Arkham, Arkham city",
        },
        {
          id: 2,
          name: "Minor Cineplex Arkham Asylum",
          address: "Central Arkham 118, Arkham Asylum, Arkham city",
        },
        {
          id: 3,
          name: "Minor Cineplex Indian Hill",
          address: "48/996 Indian Hill, Arkham city",
        },
        {
          id: 4,
          name: "Minor Cineplex Arkham Bridge",
          address: "1224 Arkham bridge, Arkham city",
        },
      ],
    },
    {
      city: "Pathumthani",
      cinemas: [
        {
          id: 5,
          name: "Minor Cineplex Riddler Factory",
          address: "Central Hall 79, Riddler factory, Arkham city",
        },
        {
          id: 6,
          name: "Minor Cineplex The Narrows",
          address: "8 Cherry's, The narrows, Arkham city",
        },
      ],
    },
    {
      city: "Nonthaburi",
      cinemas: [
        {
          id: 7,
          name: "Minor Cineplex Tricorner",
          address: "1224 Triconrner, Arkham city",
        },
      ],
    },
  ];

  return (
    <section ref={sectionRef} className="flex flex-col w-full">
      {/* Now Showing Section */}
      <div className="flex flex-col items-center gap-4 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
        <div className="flex flex-row items-center gap-6 w-full">
          <button
            onClick={() => setActiveTab("now-showing")}
            className={`flex flex-col items-start p-1 transition-all duration-500 ease-in-out hover:text-basewhite ${
              activeTab === "now-showing" 
                ? "text-basewhite border-b-2 border-base-gray-200" 
                : "text-base-gray-300"
            } text-2xl font-bold`}
          >
            Now showing
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`flex flex-col items-start px-2 py-1 transition-all duration-500 ease-in-out hover:text-basewhite ${
              activeTab === "coming-soon" 
                ? "text-basewhite border-b-2 border-base-gray-200" 
                : "text-base-gray-300"
            } text-2xl font-bold`}
          >
            Coming soon
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
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
          <h2 className="text-basewhite font-headline-2 text-[length:var(--headline-2-font-size)] leading-[var(--headline-2-line-height)] tracking-[var(--headline-2-letter-spacing)] [font-style:var(--headline-2-font-style)]">
            Special coupons
          </h2>

          <button className="text-basewhite font-bold text-base leading-6 underline [font-family:'Roboto_Condensed',Helvetica] p-0 hover:text-brandblue-100 transition-colors duration-200">
            View all
          </button>
        </div>

        <div className="flex flex-wrap gap-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-col items-start justify-center rounded-lg overflow-hidden bg-transparent group cursor-pointer"
            >
              <div
                className="w-[285px] h-[285px] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${coupon.image})` }}
              />

              <div className="flex flex-col h-48 items-start justify-between pt-4 pb-6 px-6 w-full bg-basegray-0">
                <div className="flex items-start gap-4 w-full">
                  <div className="flex flex-col items-start gap-2 flex-1">
                    <h3 className="text-basewhite font-headline-4 text-[length:var(--headline-4-font-size)] leading-[var(--headline-4-line-height)] tracking-[var(--headline-4-letter-spacing)] [font-style:var(--headline-4-font-style)] group-hover:text-brandblue-100 transition-colors duration-200">
                      {coupon.title}
                    </h3>

                    <div className="flex items-start gap-4 w-full">
                      <span className="text-basegray-300 font-body-2-regular text-[length:var(--body-2-regular-font-size)] leading-[var(--body-2-regular-line-height)] tracking-[var(--body-2-regular-letter-spacing)] [font-style:var(--body-2-regular-font-style)]">
                        Valid until
                      </span>
                      <span className="text-basegray-400 font-body-2-medium text-[length:var(--body-2-medium-font-size)] leading-[var(--body-2-medium-line-height)] tracking-[var(--body-2-medium-letter-spacing)] [font-style:var(--body-2-medium-font-style)] flex-1">
                        {coupon.validUntil}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full px-10 py-3 bg-brandblue-100 rounded text-basewhite font-body-1-medium text-[length:var(--body-1-medium-font-size)] leading-[var(--body-1-medium-line-height)] tracking-[var(--body-1-medium-letter-spacing)] [font-style:var(--body-1-medium-font-style)] hover:bg-brandblue-200 transition-colors duration-200">
                  Get coupon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Cinemas Section */}
      <div className="flex flex-col items-center gap-10 px-[120px] py-20 w-full max-w-[1440px] mx-auto">
        <div className="flex items-baseline justify-between w-full">
          <h2 className="text-basewhite font-headline-2 text-[length:var(--headline-2-font-size)] leading-[var(--headline-2-line-height)] tracking-[var(--headline-2-letter-spacing)] [font-style:var(--headline-2-font-style)]">
            All cinemas
          </h2>

          <div className="flex gap-2 bg-basegray-100 rounded p-1">
            <button
              onClick={() => setViewMode("browse-by-city")}
              className={`inline-flex items-center gap-2 px-4 py-2 transition-colors duration-200 ${
                viewMode === "browse-by-city" ? "bg-basegray-200" : "bg-basegray-100 hover:bg-basegray-200"
              } rounded`}
            >
              <img
                className="w-6 h-6"
                alt="Done round light"
                src="/assets/images/icons/done-round-light.svg"
              />
              <span className="text-basegray-400 font-body-1-medium text-[length:var(--body-1-medium-font-size)] text-center tracking-[var(--body-1-medium-letter-spacing)] leading-[var(--body-1-medium-line-height)] [font-style:var(--body-1-medium-font-style)]">
                Browse by City
              </span>
            </button>

            <button
              onClick={() => setViewMode("nearest-locations")}
              className={`inline-flex items-center gap-3 px-4 py-2 transition-colors duration-200 ${
                viewMode === "nearest-locations" ? "bg-basegray-200" : "bg-basegray-100 hover:bg-basegray-200"
              } rounded`}
            >
              <span className="text-basegray-400 font-body-1-medium text-[length:var(--body-1-medium-font-size)] text-center tracking-[var(--body-1-medium-letter-spacing)] leading-[var(--body-1-medium-line-height)] [font-style:var(--body-1-medium-font-style)]">
                Nearest Locations First
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 md:gap-6 w-full">
          {cinemasByCity.map((cityGroup, index) => (
            <div key={index} className="flex flex-col items-start gap-6 w-full">
              <h3 className="text-basegray-300 font-headline-3 text-[length:var(--headline-3-font-size)] tracking-[var(--headline-3-letter-spacing)] leading-[var(--headline-3-line-height)] [font-style:var(--headline-3-font-style)]">
                {cityGroup.city}
              </h3>

              <div className="flex flex-col gap-4 md:flex-wrap md:flex-row md:gap-5 w-full">
                {cityGroup.cinemas.map((cinema) => (
                  <div
                    key={cinema.id}
                    className="flex items-center gap-4 p-4 w-[590px] bg-transparent border border-solid border-[#21253e] rounded cursor-pointer hover:border-brandblue-100 transition-colors duration-200 group"
                  >
                    <div className="w-[52px] h-[52px] bg-basegray-100 rounded-[99px] flex items-center justify-center">
                      <div className="relative w-8 h-8">
                        <img
                          className="absolute w-[19px] h-[21px] top-[5px] left-[7px]"
                          alt="Subtract"
                          src="/assets/images/icons/subtract.svg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1 flex-1">
                      <h4 className="text-basewhite font-headline-3 text-[length:var(--headline-3-font-size)] tracking-[var(--headline-3-letter-spacing)] leading-[var(--headline-3-line-height)] [font-style:var(--headline-3-font-style)] w-full group-hover:text-brandblue-100 transition-colors duration-200">
                        {cinema.name}
                      </h4>
                      <p className="text-basegray-300 text-base leading-6 [font-family:'Roboto_Condensed',Helvetica] font-normal tracking-[0] w-full">
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

