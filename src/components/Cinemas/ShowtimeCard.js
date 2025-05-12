import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

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
          params: { cinemaId, date },
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

  const movies = Object.values(movieShowtimesMap).sort((a, b) =>
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
    <div className="space-y-8">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-[var(--base-gray-0)] rounded-lg overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left Column: Movie Poster + Info */}
            <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>

              {/* Movie Title & Info */}
              <div className="p-4 bg-[var(--base-gray-0)]">
                <h2 className="text-xl font-bold text-white">{movie.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Genre pills */}
                  {movie.genre.split(", ").map((genre, index) => (
                    <span
                      key={`${movie.id}-genre-${index}`}
                      className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                {/* Language code pill */}
                <div className="mt-2">
                  <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-md">
                    {movie.languageCode}
                  </span>
                </div>
                <Link
                  href={`/movies/${movie.id}`}
                  className="inline-block text-sm text-blue-400 hover:text-blue-300 mt-2"
                >
                  Movie detail
                </Link>
              </div>
            </div>

            {/* Right Column: Only Halls & Showtimes */}
            <div className="p-4 w-full">
              {/* Halls & Showtimes */}
              <div className="space-y-4">
                {Object.entries(movie.halls).map(([hall, times]) => (
                  <div key={`${movie.id}-${hall}`}>
                    <h3 className="text-gray-400 mb-2">{hall}</h3>
                    <div className="flex flex-wrap gap-2">
                      {times.sort().map((time, idx) => (
                        <button
                          key={`${movie.id}-${hall}-${time}-${idx}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                          onClick={() => {
                            // Handle booking or selection here
                            console.log(
                              `Selected: ${movie.title} at ${time} in ${hall}`
                            );
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
