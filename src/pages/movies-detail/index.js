import { Input } from "../../components/ui/input";
import DateSelector from "@/components/DateSelector";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";

export default function MovieDetail() {
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDateSelect = (date) => {
    console.log("Selected date:", date);
    // Fetch showtimes for the selected date
  };

  return (
    <div className="">
      กล่อง Navbar
      {/* Banner */}
      <div className="flex flex-col items-center justify-center bg-gray-800 text-white mb-[348px]">
        <img
          src={movie?.poster_url}
          alt={movie?.title}
          className="relative w-full h-[440px] gap-[10px] object-cover"
        />
        <div className="absolute bg-gradient-to-t from-[#070C1B] to-none w-full h-[440px] flex items-center justify-center text-white text-3xl font-bold"></div>

        {/* Movie Details */}
        <div className="absolute position top-[140px] flex justify-center md:flex-row bg-[#070C1B]/30 backdrop-blur-sm mb-8 rounded-lg">
        <img
              src={movie?.poster_url}
              alt={movie?.title}
              className="h-[600px] rounded shadow-lg"
            />
          <div className="flex flex-row rounded-lg shadow-lg p-15">            
            <div className="">
              <div className="p-15">
                <h1 className="text-3xl font-bold mb-2">{movie?.title}</h1>
                <div className="flex gap-2 mb-2 ">
                  <span className="bg-[#21263F] py-[6px] px-3 rounded text-sm text-[#8B93B0]">
                    Action
                  </span>
                  <span className="bg-[#21263F] py-[6px] px-3 rounded text-sm text-[#8B93B0]">
                    Crime
                  </span>
                  <span className="bg-[#21263F] py-[6px] px-3 rounded text-sm text-[#8B93B0]">
                    TH
                  </span>
                  <div className="border border-[#565F7E] my-1 mx-5"></div>
                  <span className="text-sm">
                    Release date:{" "}
                    {new Date(movie?.release_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <button className="p-4 bg-brand-blue-100 text-white rounded-lg shadow-md">
                  Movie detail
                </button>
                <p className="mb-2">{movie?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Date Selector */}
      <DateSelector onDateSelect={handleDateSelect} />
      {/* Showtimes */}
      <div className="mx-[120px] rounded-2">
        {/* Cinema Selection */}
        <div className="flex flex-row justify-center p-4 rounded gap-5 mt-20">
          <Input />
          <Select>
            <SelectTrigger className="w-1/5">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/*location hall*/}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            {showtimes.map((showtime) => (
              <AccordionItem key={showtime.showtime_id} value={showtime_id}>
                <AccordionTrigger className="bg-[#21263F] text-white p-4 rounded-lg mb-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{showtime_id}</span>
                  </div>
                  <span>{new Date(showtime.date).toLocaleDateString()}</span>
                </AccordionTrigger>
                <AccordionContent className="bg-[#21263F] text-white p-4 rounded-lg mb-2">
                  {showtime.showtimes.map((time) => (
                    <div key={time.id} className="flex justify-between mb-2">
                      <span>{time.time}</span>
                      <button className="p-2 bg-brand-blue-100 text-white rounded-lg shadow-md">
                        Book Now
                      </button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
