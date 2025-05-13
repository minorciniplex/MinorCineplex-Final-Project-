import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import ShowtimeButtons from "@/components/Cinemas/ShowtimeButtons";

export default function ShowtimeCard({ cinemaId, date }) {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShowtimes() {
      if (!cinemaId || !date) return;

      try {
        setLoading(true);
        const response = await axios.get("/api/cinemas/showtimes", {
          params: { cinemaId, date: date.fullDate },
        });

        setShowtimes(response.data.formattedData || []);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        setError(err.response?.data?.message || err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchShowtimes();
  }, [cinemaId, date]);

  // Group showtimes by movie
  const movieShowtimesMap = showtimes.reduce((acc, showtime) => {
    const { movie_id, movie_title, poster_url, genre, language_code } =
      showtime;

    if (!acc[movie_id]) {
      acc[movie_id] = {
        id: movie_id,
        title: movie_title,
        posterUrl: poster_url,
        genre,
        languageCode: language_code,
        halls: {},
      };
    }

    // Group by hall/screen
    const hallNumber = `Hall ${showtime.screen_number}`;
    if (!acc[movie_id].halls[hallNumber]) {
      acc[movie_id].halls[hallNumber] = [];
    }

    // Add showtime to this hall
    acc[movie_id].halls[hallNumber].push(showtime.start_time.substring(0, 5)); // Extract HH:MM from time

    return acc;
  }, {});

  const movies = Object.values(movieShowtimesMap).sort(
    (a, b) =>
      Object.keys(b.halls).length - Object.keys(a.halls).length ||
      a.title.localeCompare(b.title)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading showtimes: {error}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No showtimes available for this date.
      </div>
    );
  }

  return (
    <div className="py-10 md:px-24 md:py-20">
      <div className="space-y-6">
        {movies.map((movie) => (
          <div
            key={movie?.id}
            className="bg-[var(--base-gray-0)] rounded-lg overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-0">
              {/* Left Column: Movie Poster + Info */}
              <div className="w-full md:w-72 flex-shrink-0 flex flex-row md:flex-col md:items-center md:justify-center py-4 md:py-6 px-4">
                <div className="flex flex-row items-start justify-between md:flex-col gap-6 sm:gap-10 md:gap-6">
                  {/* Movie Poster */}
                  <div className="relative aspect-[2/3] w-[100px] sm:w-[150px] md:w-[200px]">
                    <Image
                      src={movie?.posterUrl}
                      alt={movie?.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>

                  {/* Movie Title & Info */}
                  <div className="bg-[var(--base-gray-0)] w-[200px]">
                    <h2 className="text-xl font-bold text-white text-left">
                      {movie?.title}
                    </h2>
                    <div className="flex flex-wrap justify-start gap-2 mt-2">
                      {/* Genre pills */}
                      {movie?.genre.split(", ").map((genre, index) => (
                        <span
                          key={`${movie.id}-genre-${index}`}
                          className="text-xs sm:text-sm bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    {/* Language code pill */}
                    <div className="flex flex-wrap justify-start mt-2 text-center sm:text-left">
                      <span className="text-xs sm:text-sm bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg">
                        {movie?.languageCode}
                      </span>
                    </div>

                    {/* Mobile only (inside the info block) */}
                    <Link
                      href={`/movies/${movie?.id}`}
                      className="inline-block text-base mt-6 md:hidden text-white underline hover:text-blue-500"
                    >
                      Movie detail
                    </Link>
                  </div>

                  {/* Desktop only (outside the info block) */}
                  <Link
                    href={`/movies/${movie?.id}`}
                    className="hidden md:inline-block text-base text-white underline hover:text-blue-500 mt-2"
                  >
                    Movie detail
                  </Link>
                </div>
              </div>

              {/* Right Column: Only Halls & Showtimes */}
              <div className="px-4 py-6 md:p-10 w-full">
                {/* Halls & Showtimes */}
                <div className="space-y-10 sm:space-y-14">
                  {Object.entries(movie?.halls).map(([hall, times]) => (
                    <div key={`${movie?.id}-${hall}`}>
                      <h3 className="text-[var(--base-gray-400)] mb-4 text-xl sm:text-2xl">
                        {hall}
                      </h3>
                      <ShowtimeButtons
                        times={times}
                        date={date}
                        movie={movie}
                        hall={hall}
                        onSelect={({ time, movie, hall }) => {
                          console.log(
                            `Selected: ${movie?.title} at ${time} in ${hall}`
                          );
                          // คุณสามารถใส่โค้ดสำหรับ handle booking ได้ที่นี่
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
