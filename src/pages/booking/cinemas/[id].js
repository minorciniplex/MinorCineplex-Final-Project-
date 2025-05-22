import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import CinemaDetailCard from "@/components/Cinemas/CinemaDetailCard";
import DateSelector from "@/components/DateSelector";
import ShowtimeCard from "@/components/Cinemas/ShowtimeCard";
import Navbar from "@/components/Navbar/Navbar";
import FooterSection from "@/components/sections/FooterSection/FooterSection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import Image from "next/image";

export default function CinemaPage() {
  const router = useRouter();
  const { id: cinemaId } = router.query;
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

 
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  
  const fetchShowtimes = useCallback(
    async (page, pageSize) => {

      if (!cinemaId) {
        console.log("Missing cinemaId, returning empty data");
        return { data: [], hasMore: false };
      }

      if (!selectedDate || !selectedDate.fullDate) {
        console.log(
          "Missing selectedDate or selectedDate.fullDate, returning empty data"
        );
        return { data: [], hasMore: false };
      }

      try {
        const response = await axios.get("/api/cinemas/showtimes", {
          params: { cinemaId, date: selectedDate.fullDate, page, pageSize },
        });

        setIsFirstLoad(false);

        return {
          data: response.data.data?.showtimes,
          hasMore: response.data.data.pagination?.hasMore,
        };
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        setIsFirstLoad(false); 
        return { data: [], hasMore: false }; 
      }
    },
    [cinemaId, selectedDate]
  );

  
  const {
    items: showtimes,
    isLoading,
    error,
    hasMore,
    loaderRef,
    resetItems, 
  } = useInfiniteScroll(fetchShowtimes, {
    pageSize: 4,
    threshold: 100,
    dependencies: [cinemaId, selectedDate?.fullDate],
  });

  useEffect(() => {
    if (selectedDate?.fullDate && cinemaId) {
      resetItems();
    }
  }, [selectedDate?.fullDate, cinemaId, resetItems]);

  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);

  if (!isRouterReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main>
      <div className="hidden md:block relative w-full h-[580px] overflow-hidden">
        <Navbar />
        {/* Background image */}
        <Image
          fill
          src="/images/cinema/hero-bg-movie.jpg"
          alt="Cinema background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Hero Card */}
        {cinemaId && <CinemaDetailCard cinemaId={cinemaId} />}
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden bg-[#00000033] mb-2">
        <Navbar />
      </div>

      {/* Mobile CinemaDetailCard */}
      <div className="md:hidden">
        {cinemaId && <CinemaDetailCard cinemaId={cinemaId} />}
      </div>

      {/* Date Selector*/}
      <DateSelector onDateSelect={handleDateSelect} />

      {/* First load state - only show on initial fetch */}
      {isFirstLoad && isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading showtimes...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Failed to load showtimes. Please try again.
        </div>
      )}

      {/* Showtime Cards */}
      {showtimes?.length > 0 && (
        <ShowtimeCard showtimes={showtimes} date={selectedDate} />
      )}

      {/* Invisible loader element - this is what the Intersection Observer watches */}
      {hasMore && <div ref={loaderRef} className="h-10" />}

      {/* Loading more indicator - only show during pagination, not initial load */}
      {!isFirstLoad && isLoading && hasMore && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* End of content message */}
      {!isLoading && !hasMore && showtimes?.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more showtimes available.
        </div>
      )}

      {/* Empty state - only show if we're not loading and we have a date selected */}
      {!isFirstLoad &&
        !isLoading &&
        selectedDate &&
        showtimes?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No showtimes available for this date.
          </div>
        )}

      <FooterSection />
    </main>
  );
}
