import { Star as StarFillIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { getDistance } from 'geolib';
import { useRouter } from "next/router";
import CouponsCard from "@/components/Coupons-components/CouponsCard";
import { useCouponClaim } from "@/hooks/useCouponClaim";
import { useFetchCoupon } from "@/context/fecthCouponContext";
import { movieApi, cinemaApi, couponApi } from '@/services/api';

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error) {
    return <div style={{ color: 'red', padding: 32 }}>เกิดข้อผิดพลาด: {error.message}</div>;
  }
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {React.cloneElement(children, { onError: setError })}
    </React.Suspense>
  );
}

// เพิ่มฟังก์ชันแปลงวันที่
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const FrameByCinema = ({ filters , coupon_id, onError }) => {
  const sectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState("now-showing");
  const [viewMode, setViewMode] = useState("browse-by-city");
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [movieGenresMap, setMovieGenresMap] = useState({});
  const [movieLangMap, setMovieLangMap] = useState({});
  const [allCinemasByProvince, setAllCinemasByProvince] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCinemas, setNearestCinemas] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const {coupons , setCoupons} = useFetchCoupon();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const { isClaimed, isLoading, handleClaimCoupon, alertOpen, setAlertOpen } = useCouponClaim(coupon_id);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const [nowShowingRes, comingSoonRes] = await Promise.all([
          movieApi.getNowShowing(filters),
          movieApi.getComingSoon(filters)
        ]);
        console.log('nowShowingRes', nowShowingRes.data);
        console.log('comingSoonRes', comingSoonRes.data);
        setNowShowingMovies(nowShowingRes.data || []);
        setComingSoonMovies(comingSoonRes.data || []);
        // หมายเหตุ: ถ้าต้องการ genres/languages เพิ่มเติม สามารถดึงเพิ่มได้ที่นี่

        // --- เพิ่มส่วนนี้ ---
        // รวมหนังทั้งหมด
        const allMovies = [...(nowShowingRes.data || []), ...(comingSoonRes.data || [])];
        const genresMap = {};
        const langMap = {};
        allMovies.forEach(movie => {
          // ปรับชื่อ key ให้ตรงกับข้อมูลจริง ถ้าไม่ตรงให้เปลี่ยนชื่อ
          genresMap[movie.movie_id || movie.id] = movie.genres || [];
          langMap[movie.movie_id || movie.id] = movie.languages || [];
        });
        setMovieGenresMap(genresMap);
        setMovieLangMap(langMap);
        // --- จบส่วนนี้ ---

      } catch (error) {
        console.error('Error fetching movies:', error);
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [filters]);

  useEffect(() => {
    async function fetchCinemas() {
      setCinemaLoading(true);
      try {
        const { data: cinemas } = await cinemaApi.getAll();
        console.log('cinemas', cinemas);
        const grouped = {};
        cinemas?.forEach(cinema => {
          if (!grouped[cinema.province]) grouped[cinema.province] = [];
          grouped[cinema.province].push(cinema);
        });
        setAllCinemasByProvince(grouped);
      } catch (error) {
        console.error('Error fetching cinemas:', error);
        if (onError) onError(error);
      } finally {
        setCinemaLoading(false);
      }
    }
    fetchCinemas();
  }, []);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const { data } = await couponApi.getActive();
        console.log('coupons', data);
        setCoupons(data || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        if (onError) onError(error);
      }
    }
    fetchCoupons();
  }, [setCoupons]);

  useEffect(() => {
    if (viewMode === 'nearest-locations') {
      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              setLocationError(null);
            },
            (error) => {
              setLocationError('ไม่สามารถเข้าถึงตำแหน่งของคุณได้');
            }
          );
        } else {
          setLocationError('เบราว์เซอร์ของคุณไม่รองรับการขอตำแหน่ง');
        }
      }
    }
  }, [viewMode]);

  useEffect(() => {
    async function fetchNearestCinemas() {
      try {
        const { data: cinemas } = await cinemaApi.getAll();
        if (userLocation && cinemas) {
          const cinemasWithDistance = cinemas.map(cinema => ({
            ...cinema,
            distance: getDistance(
              { latitude: userLocation.latitude, longitude: userLocation.longitude },
              { latitude: cinema.latitude, longitude: cinema.longitude }
            )
          }));
          const sorted = cinemasWithDistance.sort((a, b) => a.distance - b.distance);
          setNearestCinemas(sorted);
        }
      } catch (error) {
        console.error('Error fetching nearest cinemas:', error);
      }
    }
    if (userLocation && viewMode === 'nearest-locations') {
      fetchNearestCinemas();
    }
  }, [viewMode, userLocation]);

  // เพิ่ม useEffect สำหรับสลับ tab อัตโนมัติเมื่อค้นหา
  useEffect(() => {
    if (filters) {
      if (nowShowingMovies.length === 0 && comingSoonMovies.length > 0) {
        setActiveTab("coming-soon");
      } else if (nowShowingMovies.length > 0) {
        setActiveTab("now-showing");
      }
    }
    // eslint-disable-next-line
  }, [nowShowingMovies, comingSoonMovies]);

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

  // log state สำคัญก่อน return
  console.log({ nowShowingMovies, comingSoonMovies, coupons, allCinemasByProvince });

  return (
    <>
      <section
        ref={sectionRef}
        className="flex flex-col w-full mt-[170px] md:mt-20"
      >
        {/* Now Showing Section */}
        <div className="flex flex-col items-center gap-2 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
          <div className="flex flex-row items-center gap-6 w-full mb-8 ">
            <button
              onClick={() => setActiveTab("now-showing")}
              className={`pb-1 transition-all duration-500 ease-in-out font-bold text-2xl md:text-3xl ${
                activeTab === "now-showing"
                  ? "text-white border-b-2 border-base-gray-200"
                  : "text-base-gray-400"
              }`}
            >
              Now showing
            </button>
            <button
              onClick={() => setActiveTab("coming-soon")}
              className={`pb-1 transition-all duration-500 ease-in-out font-bold text-2xl md:text-3xl ${
                activeTab === "coming-soon"
                  ? "text-white border-b-2 border-base-gray-200"
                  : "text-base-gray-400"
              }`}
            >
              Coming soon
            </button>
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
            {loading ? (
              <div className="col-span-full text-center text-base-gray-400 py-10">
                Loading...
              </div>
            ) : (activeTab === "now-showing"
                ? nowShowingMovies
                : comingSoonMovies
              )?.slice(startIndex, endIndex).length === 0 ? (
              <div className="col-span-full text-center text-base-gray-400 py-10">
                No movies found.
              </div>
            ) : (
              (activeTab === "now-showing" ? nowShowingMovies : comingSoonMovies)
                ?.slice(startIndex, endIndex)
                .map((movie) => (
                  <div
                    key={movie.movie_id || movie.id}
                    className="flex flex-col items-start gap-3 md:gap-4 group cursor-pointer w-[161px] min-h-[385px] md:w-[285px] md:min-h-[416px]"
                  >
                    <div
                      className="w-[161px] h-[235px] md:w-[285px] md:h-[416px] rounded-[4px] bg-cover bg-center shadow-md mx-auto transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${
                          movie.poster_url || movie.poster
                        })`,
                      }}
                      onClick={() =>
                        router.push(
                          `/movies-detail/${movie.movie_id || movie.id}`
                        )
                      }
                    />
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base-gray-300 body-2-regular flex items-center">
                          {formatDate(movie.release_date || movie.date)}
                        </span>
                        <div className="flex items-center">
                          <StarFillIcon className="w-4 h-4 fill-[#4E7BEE] text-[#4E7BEE]" />
                          <span className="text-base-gray-300 body-2-regular ml-1 flex items-center">
                            {movie.rating !== undefined && movie.rating !== null ? Number(movie.rating).toFixed(1) : ''}
                          </span>
                        </div>
                      </div>
                      <h3
                        className="text-basewhite font-bold truncate max-w-full text-lg md:text-[22.5px] group-hover:text-brandblue-100 transition-colors duration-200"
                        onClick={() =>
                          router.push(
                            `/movies-detail/${movie.movie_id || movie.id}`
                          )
                        }
                      >
                        {movie.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      {/* Genres */}
                      {movieGenresMap[movie.movie_id]?.map((genre, idx) => (
                        <span
                          key={movie.movie_id + "-" + genre}
                          className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular rounded"
                        >
                          {genre}
                        </span>
                      ))}
                      {/* Languages */}
                      {(() => {
                        const langs = movieLangMap[movie.movie_id] || [];
                        const original = langs.find((l) => l.type === "original");
                        const dubbed = langs.find((l) => l.type === "dubbed");
                        if (dubbed && original) {
                          return (
                            <span
                              key={
                                movie.movie_id + "-" + original.code + "-dubbed"
                              }
                              className="px-3 py-1.5 bg-base-gray-100 text-base-gray-400 body-2-regular rounded"
                            >
                              TH/{original.code}
                            </span>
                          );
                        } else if (original) {
                          return (
                            <span
                              key={
                                movie.movie_id + "-" + original.code + "-original"
                              }
                              className="px-3 py-1.5 bg-base-gray-100 text-base-gray-400 body-2-regular rounded"
                            >
                              {original.code}
                            </span>
                          );
                        } else if (dubbed) {
                          return (
                            <span
                              key={
                                movie.movie_id + "-" + dubbed.code + "-dubbedonly"
                              }
                              className="px-3 py-1.5 bg-base-gray-100 text-base-gray-300 body-2-regular rounded"
                            >
                              {dubbed.code}
                            </span>
                          );
                        } else {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                ))
            )}
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
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
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
            <button
              className="text-basewhite underline body-1-medium md:body-1-medium p-0 hover:text-brandblue-100 transition-colors duration-200 whitespace-nowrap"
              onClick={() => router.push("/coupons")}
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5 w-full  md:px-0">
            {coupons.length === 0 ? (
              <div className="col-span-full text-center text-base-gray-400 py-10">
                ไม่พบคูปอง
              </div>
            ) : (
              coupons
                .slice(0, 4)
                .map((coupon) => (
                  <CouponsCard
                    key={coupon.coupon_id}
                    coupon_id={coupon.coupon_id}
                    image={coupon.image}
                    title={coupon.title}
                    end_date={coupon.end_date}
                    onClaimCoupon={() => handleClaimCoupon(coupon.coupon_id)}
                    isClaimed={isClaimed}
                    isLoading={isLoading}
                    alertOpen={alertOpen}
                    setAlertOpen={setAlertOpen}
                  />
                ))
            )}
          </div>
        </div>

        {/* All Cinemas Section */}
        <div className="flex flex-col items-center gap-4 md:gap-10 px-4 md:px-[120px] py-4 md:py-20 w-full max-w-full md:max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3 md:gap-0">
            <h2 className="text-base-white headline-2 text-left pl-0 md: prose-headline-2 ">
              All cinemas
            </h2>
            <div className="w-full h-[44px] flex gap-1 bg-base-gray-100 rounded-[4px] p-1 mt-2 md:w-[380px] md:h-[48px] md:mt-0">
              <button
                className={`flex-1 flex items-center justify-center gap-1 px-0 py-2 rounded-[4px] font-bold transition text-xs md:text-base h-full ${
                  viewMode === "browse-by-city"
                    ? "bg-[#434665] text-white shadow"
                    : "bg-transparent text-[#8B93B0] hover:bg-[#35385a]"
                }`}
                onClick={() => setViewMode("browse-by-city")}
              >
                {viewMode === "browse-by-city" && (
                  <svg
                    className="w-4 h-4 text-brandblue-100"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                Browse by City
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-1 px-0 py-2 rounded-[4px] font-bold transition text-xs md:text-base h-full ${
                  viewMode === "nearest-locations"
                    ? "bg-[#434665] text-white shadow"
                    : "bg-transparent text-[#8B93B0] hover:bg-[#35385a]"
                }`}
                onClick={() => setViewMode("nearest-locations")}
              >
                {viewMode === "nearest-locations" && (
                  <svg
                    className="w-4 h-4 text-brandblue-100"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                Nearest Locations First
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 md:gap-6 w-full">
            {viewMode === "browse-by-city" ? (
              Object.entries(allCinemasByProvince)
                .sort((a, b) => b[1].length - a[1].length)
                .map(([province, cinemas]) => (
                  <div
                    key={province}
                    className="flex flex-col items-start gap-6 w-full"
                  >
                    <h3 className="text-base-gray-300 headline-3 text-base md:headline-3 tracking-[var(--headline-3-letter-spacing)] leading-[var(--headline-3-line-height)] [font-style:var(--headline-3-font-style)]">
                      {province}
                    </h3>
                    <div className="flex flex-col gap-4 md:flex-wrap md:flex-row md:gap-5 w-full">
                      {cinemas.map((cinema) => (
                        <div
                          key={cinema.cinema_id}
                          className="w-full min-h-[120px] max-w-[344px] mx-auto p-4 border border-base-gray-100 rounded-[4px] flex items-center gap-4 mb-2 md:mb-0 md:p-4 md:rounded-[4px] md:bg-transparent md:max-w-[590px] md:border md:border-base-gray-100 cursor-pointer hover:border-brandblue-100 transition-colors duration-200 group md:mx-0"
                        >
                          <div className="w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-full bg-[#21263F]">
                            <FmdGoodIcon
                              style={{ color: "#4E7BEE", fontSize: 20 }}
                            />
                          </div>
                          <div className="flex flex-col items-start justify-center gap-1 flex-1 break-words w-full">
                            <h4 className="text-basewhite headline-3 md:headline-3 group-hover:text-brandblue-100 transition-colors duration-200 break-words w-full">
                              {cinema.name}
                            </h4>
                            <p className="body-2-regular text-base-gray-300 text-sm md:body-2-regular break-words w-full">
                              {cinema.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {cinemaLoading ? (
                  <div className="text-base-gray-400 py-4">Loading...</div>
                ) : locationError ? (
                  <div className="text-base-gray-400 py-4">{locationError}</div>
                ) : !userLocation ? (
                  <div className="text-base-gray-400 py-4">
                    Getting your location...
                  </div>
                ) : nearestCinemas.length === 0 ? (
                  <div className="text-base-gray-400 py-4">No cinemas found.</div>
                ) : (
                  nearestCinemas.map((cinema) => (
                    <div
                      key={cinema.cinema_id}
                      className="w-full min-h-[120px] max-w-[590px] mx-auto p-4 border border-base-gray-100 rounded-[4px] flex items-center gap-4 mb-2 md:mb-0 md:p-4 md:rounded-[4px] md:bg-transparent md:border md:border-base-gray-100 cursor-pointer hover:border-brandblue-100 transition-colors duration-200 group"
                    >
                      <div className="w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-full bg-[#21263F]">
                        <FmdGoodIcon style={{ color: "#4E7BEE", fontSize: 20 }} />
                      </div>
                      <div className="flex flex-col items-start justify-center gap-1 flex-1 break-words w-full">
                        <h4 className="text-basewhite headline-3 md:headline-3 group-hover:text-brandblue-100 transition-colors duration-200 break-words w-full">
                          {cinema.name}
                        </h4>
                        <p className="body-2-regular text-base-gray-300 text-sm md:body-2-regular break-words w-full">
                          {cinema.address}
                        </p>
                        <span className="text-brandblue-100 text-xs mt-1">
                          {(cinema.distance / 1000).toFixed(2)} KM.
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default function FrameByCinemaWithBoundary(props) {
  return (
    <ErrorBoundary>
      <FrameByCinema {...props} />
    </ErrorBoundary>
  );
}