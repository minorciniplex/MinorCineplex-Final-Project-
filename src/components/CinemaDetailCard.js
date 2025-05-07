import { useState, useEffect } from "react";
import axios from "axios";

export default function CinemaDetailCard({ cinemaId }) {
  const [cinema, setCinema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCinemaDetails() {
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

  // Parse facilities from JSON if stored as a string
  const facilities = cinema?.facilities || [];

  return (
    <>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-10 flex items-center justify-center px-4 py-8 md:py-12">
        {/* Cinema detail card */}
        <div className="w-full max-w-5xl overflow-hidden rounded-lg shadow-lg bg-[#070C1BB2] bg-opacity-70 text-white flex flex-col md:flex-row">
          {/* Left side with cinema image */}
          <div className="md:w-1/3">
            <div className="h-64">
              <img
                src={cinema.pic_url}
                alt={cinema.name}
                className="object-cover w-full h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          </div>

          {/* Right side with cinema details */}
          <div className="md:w-2/3 p-6 overflow-y-auto max-h-[580px]">
            <h2 className="text-2xl font-bold mb-4">{cinema.name}</h2>

            {/* Facilities badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {facilities.map((facility, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                >
                  {facility}
                </span>
              ))}
            </div>

            {/* Description paragraphs */}
            {cinema.description &&
              cinema.description.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-300 mb-4">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </div>
      </>
  );
}
