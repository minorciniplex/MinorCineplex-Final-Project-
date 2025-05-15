import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import Image from "next/image";

export default function ShowMovieDetail() {
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get("/api/movies-detail/getMoviesDetail");
        if (response.status !== 200 || !response.data.data) {
          throw new Error("Failed to fetch movie details");
        }
        setMovie(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center bg-[--background] text-white md:mb-[348px]">
      <Image
        src={movie?.poster_url}
        alt={movie?.title}
        className="hidden md:block md:relative md:w-full md:h-[440px] md:gap-[10px] md:object-cover"
        width={1920}
        height={440}
        priority
      />
      <div className="hidden md:block md:absolute bg-gradient-to-t from-[--base-gray-0] to-none w-full h-[440px] items-center justify-center text-white text-3xl font-bold"></div>

      {/* Movie Details */}
      <div className="md:absolute md:position md:flex md:justify-center md:top-[140px] bg-[--base-gray-0]/30 md:backdrop-blur-sm mb-8 rounded-lg bg-gradient-to-t from-[--base-gray-0] to-none">
        <div className="flex flex-col md:flex-row rounded-lg">
          <Image
            src={movie?.poster_url}
            alt={movie?.title}
            className="w-full md:w-auto md:h-[600px] rounded shadow-lg md:object-contain"
            width={400}
            height={600}
            priority
          />
          <div className="flex flex-col justify-start px-4 py-10 md:p-[60px]">
            <div>
              <h1 className="text-4xl font-bold mb-4">{movie?.title}</h1>
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                {genres?.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-2 md:px-3 rounded text-xs md:text-sm text-[--base-gray-300]"
                  >
                    {genre}
                  </span>
                ))}
                <span className="bg-[--base-gray-100] py-[4px] md:py-[6px] px-2 md:px-3 rounded text-xs md:text-sm text-[--base-gray-300]">
                  {movie?.languages?.code}
                </span>
                <div className="border md:border border-[--base-gray-200] md:my-1 md:mx-5"></div>
                <span className="w-full md:w-auto flex justify-start items-center mt-2 md:mt-0">
                  Release date:{" "}
                  {new Date(movie?.release_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <button className="py-3 px-10 md:py-3 md:px-10 bg-brand-blue-100 text-white rounded-sm shadow-md mt-6 mb-10 md:my-12">
                Movie detail
              </button>
              <p className="">{movie?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
