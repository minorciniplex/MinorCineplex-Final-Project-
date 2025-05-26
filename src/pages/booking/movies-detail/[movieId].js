import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import DateSelector from "@/components/DateSelector";
import Navbar from "@/components/Navbar/Navbar";
import React from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import ShowTimes from "@/components/MovieDetail/ShowTimes";
import ShowMovieDetail from "@/components/MovieDetail/ShowMovieDetail";
import FooterSection from "@/components/sections/FooterSection/FooterSection";
import ShowSearchCinema from "@/components/MovieDetail/ShowSearchCinema";

export default function MovieDetail() {
  const router = useRouter();
  const { movieId } = router.query;
  const [selectedDate, setSelectedDate] = useState(null);
  const [cinemaName, setCinemaName] = useState("");
  const [cityName, setCityName] = useState("");
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [debouncedCinemaName, setDebouncedCinemaName] = useState("");
  const [debouncedCityName, setDebouncedCityName] = useState("");
  const debounceTimeout = useRef();

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedCinemaName(cinemaName);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [cinemaName]);

  // Debounce cityName
  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedCityName(cityName);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [cityName]);

  // Fetch showtimes based on filters
  const fetchShowtimes = useCallback(
    async (page, pageSize) => {
      if (!movieId || !selectedDate?.fullDate) {
        console.log("Missing movieId or selectedDate, returning empty data");
        return { data: [], hasMore: false };
      }

      try {
        setLoadingShowtimes(true);
        const response = await axios.get("/api/movies-detail/getShowTimes", {
          params: {
            movieId: movieId,
            date: selectedDate.fullDate,
            cinemaName: debouncedCinemaName || undefined,
            province: debouncedCityName || undefined,
            page,
            pageSize,
          },
        });

        return {
          data: response.data.data?.showtimes,
          hasMore: response.data.data.pagination?.hasMore,
        };
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        return { data: [], hasMore: false };
      } finally {
        setLoadingShowtimes(false);
      }
    },
    [movieId, selectedDate, debouncedCinemaName, debouncedCityName]
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
    threshold: 300,
    dependencies: [
      movieId,
      selectedDate?.fullDate,
      debouncedCinemaName,
      debouncedCityName,
    ],
  });

  useEffect(() => {
    if (selectedDate?.fullDate && movieId) {
      resetItems();
    }
  }, [
    selectedDate?.fullDate,
    movieId,
    debouncedCinemaName,
    debouncedCityName,
    resetItems,
  ]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await axios.get("/api/movies-detail/getCities");
        setCities(response.data.cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]); // Set empty array on error
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Handle cinema search
  const handleCinemaSearch = (name) => {
    setCinemaName(name);
  };

  // Handle city selection
  const handleCityChange = (city) => {
    setCityName(city);
  };

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

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
    <div>
      <Navbar />
      {movieId && <ShowMovieDetail movieId={movieId} />}
      <DateSelector onDateSelect={handleDateSelect} />
      <div className="mb-11 md:mx-[120px] md:mb-[80px] rounded-2">
        <div className="md:flex md:flex-row justify-between rounded md:gap-5 md:mt-20 flex-col py-10 px-4 md:py-0 md:px-0 space-y-5 md:space-y-0">
          <ShowSearchCinema
            placeholder="Search cinema"
            onSearch={handleCinemaSearch}
            value={cinemaName}
            onChange={(e) => setCinemaName(e.target.value)}
            
          />
          <Select
            value={cityName}
            onValueChange={handleCityChange}
            disabled={loadingCities}
          >
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem
                  key={city.id || city.province}
                  value={city.province}
                >
                  {city.province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Failed to load showtimes. Please try again.
          </div>
        )}

        {/* Showtimes Display */}
        {loadingShowtimes ? (
          <div className="text-center py-10">Loading showtimes...</div>
        ) : showtimes.length > 0 ? (
          <ShowTimes showtimes={showtimes} date={selectedDate} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            No showtimes available for the selected filters.
          </div>
        )}
      </div>

      {/* Invisible loader element - this is what the Intersection Observer watches */}
      {hasMore && <div ref={loaderRef} className="h-10" />}

      {/* Loading more indicator - only show during pagination, not initial load */}
      {isLoading && hasMore && (
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
      {!isLoading && selectedDate && showtimes?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No showtimes available for this date.
        </div>
      )}

      <FooterSection />
    </div>
  );
}
