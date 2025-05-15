import { Input } from "../../components/ui/input";
import DateSelector from "@/components/DateSelector";
import { useEffect, useState } from "react";
import NavbarByCinema from "../../components/NavBar";
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
      <NavbarByCinema />
      {/* Banner */}
      <div className="flex flex-col items-center justify-center bg-gray-800 text-white mb-[348px]">
        <img
          src={movie?.poster_url}
          alt={movie?.title}
          className="relative w-full h-[440px] gap-[10px] object-cover"
        />
        <div className="absolute bg-gradient-to-t from-[--base-gray-0] to-none w-full h-[440px] flex items-center justify-center text-white text-3xl font-bold"></div>

        {/* Movie Details */}
        <div className="absolute position top-[140px] bg-[--base-gray-0]/30 backdrop-blur-sm mb-8 rounded-lg bg-gradient-to-t from-[--base-gray-0] to-none">
          <div className="flex flex-row rounded-lg">
            <img
              src={movie?.poster_url}
              alt={movie?.title}
              className="h-[600px] rounded shadow-lg"
            />
            <div className="flex flex-col justify-start p-[60px]">
              <div className="">
                <h1 className="text-4xl font-bold mb-4">{movie?.title}</h1>
                <div className="flex gap-2 mb-2 ">
                  <span className="bg-[--base-gray-100] py-[6px] px-3 rounded text-sm text-[--base-gray-300]">
                    Action
                  </span>
                  <span className="bg-[--base-gray-100] py-[6px] px-3 rounded text-sm text-[--base-gray-300]">
                    Crime
                  </span>
                  <span className="bg-[--base-gray-100] py-[6px] px-3 rounded text-sm text-[--base-gray-300]">
                    TH
                  </span>
                  <div className="border border-[--base-gray-200] my-1 mx-5"></div>
                  <span className="flex justify-center items-center ">
                    Release date:{" "}
                    {new Date(movie?.release_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <button className="p-4 bg-brand-blue-100 text-white rounded-lg shadow-md mt-12 mb-12">
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
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
