import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

export default function CinemaDetailCard({ cinemaId }) {
  const [cinema, setCinema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchCinemaDetails() {
      if (!cinemaId) return;

      try {
        setIsLoading(true);

        // Fetch cinema details from our API endpoint
        const response = await axios.get(`/api/cinemas/detail?id=${cinemaId}`);
        setCinema(response.data?.data);
      } catch (err) {
        setError("Failed to load cinema details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (cinemaId) {
      fetchCinemaDetails();
    }
  }, [cinemaId]);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-800 animate-pulse rounded-lg"></div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!cinema) {
    return <div className="text-gray-500 p-4">Cinema not found</div>;
  }

  const facilities = cinema?.facilities || [];

  return (
    <>
      {/* Overlay desktop*/}
      <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-10 items-center justify-center md:px-4 md:pb-[60px] md:pt-[120px]">
        {/* Cinema detail card*/}
        <div className="w-full max-w-7xl overflow-hidden rounded-lg shadow-lg bg-[#070C1BB2] bg-opacity-70 text-white flex flex-col md:flex-row">
          {/* Left side with cinema image */}
          <div className="md:w-[274px]">
            <div className="h-[400px] relative">
              <Image
                src={cinema?.pic_url}
                alt={cinema?.name}
                fill
                priority
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover w-full h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          </div>

          {/* Right side with cinema details */}
          <div className="md:w-full p-[60px] pb-[104px] overflow-y-auto max-h-[580px]">
            <h2 className="text-4xl font-bold mb-4">{cinema.name}</h2>
            {/* Facilities badges */}
            <div className="flex flex-wrap gap-2 mb-12">
              {facilities.map((facility, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-[var(--base-gray-100)] text-[var(--base-gray-300)] rounded-sm text-sm"
                >
                  {facility}
                </span>
              ))}
            </div>

            {/* Description paragraphs */}
            {cinema.description &&
              cinema.description.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-300">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/*mobile*/}
      <div className="bg-[#070C1BB2] flex flex-col gap-6 md:hidden items-center justify-center pb-4 px-4 pt-12">
        {/* Top section with image and title */}
        <div className="flex flex-row justify-between gap-6 w-full">
          <div className="relative w-1/2 h-40 ">
            <Image
              src={cinema?.pic_url}
              alt={cinema?.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover rounded"
            />
          </div>
          <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{cinema?.name}</h2>
            {/* Facilities badges */}
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-[var(--base-gray-100)] text-[var(--base-gray-300)] rounded-sm text-sm"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="text-base space-y-4">
          <p>{cinema?.description}</p>
        </div>
      </div>
    </>
  );
}
