import Image from "next/image";
import Link from "next/link";
import ShowtimeButtons from "@/components/MovieDetail/ShowTimeButtons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ShowtimeCard({ showtimes, date }) {
  const router = useRouter();
  const [movies, setMovie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const controller = new AbortController();
        const response = await axios.get(
          `/api/movies-detail/getMoviesDetail?id=${showtimes[0].movie_id}`,
          {
            signal: controller.signal,
            timeout: 10000,
          }
        );

        if (response.status !== 200 || !response.data.data) {
          throw new Error("Failed to fetch movie details");
        }
        setMovie(response.data.data);
        return () => controller.abort();
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled");
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, []);

  console.log("showtimes", showtimes);
  const handleSelect = ({ time, movie, date, hall, showtime_id }) => {
    // ตัวอย่างการ push ไปหน้าจองตั๋ว
    const query = new URLSearchParams({
      poster: movie.posterUrl,
      title: movie.title,
      time: time,
      date: date.fullDate,
      screenNumber: hall.split(" ")[1],
      genres: JSON.stringify(movies.movie_genre_mapping), // แปลง object เป็น string
      language: JSON.stringify(movies.original_language),
      cinemaName: movie.cinemaName,
      showtimeId: showtime_id,
      movieId: movie.movie_id,
      price: movie.prices[hall],
    }).toString();

    router.push(`/booking/seats/seat?${query}`);
  };

  return (
    <div className="py-10 md:px-24 md:py-20">
      <div className="space-y-6">
        {showtimes.map((movie) => (
          <div
            key={movie?.movie_id}
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
                  <div className="bg-[var(--base-gray-0)] md:w-[200px]">
                    <h2 className="text-xl font-bold text-white text-left">
                      {movie?.title}
                    </h2>
                    <div className="flex flex-wrap justify-start gap-2 mt-2">
                      {/* Genre pills */}
                      {movie?.genre.split(", ").map((genre, index) => (
                        <span
                          key={`${movie.movie_id}-genre-${index}`}
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
                      href={`/movies/${movie?.movie_id}`}
                      className="inline-block text-base mt-6 md:hidden text-white underline hover:text-blue-500"
                    >
                      Movie detail
                    </Link>
                  </div>

                  {/* Desktop only (outside the info block) */}
                  <Link
                    href={`/movies/${movie?.movie_id}`}
                    className="hidden md:inline-block text-base text-white underline hover:text-blue-500 mt-2"
                  >
                    Movie detail
                  </Link>
                </div>
              </div>

              {/* Right Column: Only Halls & Showtimes */}
              <div className="space-y-10 sm:space-y-14">
                {Object.entries(movie?.halls).map(([hall, timesArray]) => {
                  // 1️⃣ Flatten times into an array of strings (as before)
                  const formattedTimes = timesArray.map((t) => t.time);

                  return (
                    <div key={`${movie?.movie_id}-${hall}`}>
                      <h3 className="text-[var(--base-gray-400)] mb-4 text-xl sm:text-2xl">
                        {hall}
                      </h3>
                      <ShowtimeButtons
                        times={formattedTimes}
                        date={date}
                        movie={movie}
                        hall={hall}
                        onSelect={({ time, movie, hall, date }) => {
                          const showtimeObj = timesArray.find(
                            (t) => t.time === time
                          );
                          const showtime_id = showtimeObj
                            ? showtimeObj.showtime_id
                            : null;

                          handleSelect({
                            time,
                            movie,
                            hall,
                            date,
                            showtime_id, // Pass the ID along
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
