import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
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
  const [showtimes, setShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Fetch showtimes based on filters
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movieId || !selectedDate?.fullDate) return;

      try {
        setLoadingShowtimes(true);
        const response = await axios.get("/api/movies-detail/getShowTimes", {
          params: {
            movieId: movieId,
            date: selectedDate.fullDate,
            cinemaName: cinemaName || undefined,
            province: cityName || undefined,
          },
        });

        if (response.data && response.data.data) {
          const groupedData = groupShowtimesByCinemaAndScreen(
            response.data.data
          );
          setShowtimes(groupedData);
        }
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    // Only fetch if movieId is available (after router is ready)
    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId, selectedDate, cinemaName, cityName]);

  const groupShowtimesByCinemaAndScreen = (data) => {
    const cinemaMap = new Map();

    data.forEach((showtime) => {
      const cinemaName = showtime.screens.cinemas.name;
      const screenNumber = showtime.screens.screen_number;
      const facilities = showtime.screens.cinemas.facilities;
      const date = showtime.date;
      const key = cinemaName;

      if (!cinemaMap.has(key)) {
        cinemaMap.set(key, {
          name: cinemaName,
          facilities: facilities,
          date: date,
          screens: {},
        });
      }

      const cinema = cinemaMap.get(key);

      if (!cinema.screens[screenNumber]) {
        cinema.screens[screenNumber] = [];
      }

      cinema.screens[screenNumber].push(showtime.start_time.substring(0, 5));
    });

    return Array.from(cinemaMap.values());
  };

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

        {/* Showtimes Display */}
        {loadingShowtimes ? (
          <div className="text-center py-10">Loading showtimes...</div>
        ) : showtimes.length > 0 ? (
          <ShowTimes showtimes={showtimes} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            No showtimes available for the selected filters.
          </div>
        )}
      </div>
      <FooterSection />
    </div>
  );
}
