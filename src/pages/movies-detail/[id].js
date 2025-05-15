import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import DateSelector from "@/components/DateSelector";
import Navbar from "@/components/Navbar/Navbar";
import React from "react";
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

export default function MovieDetail() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRouterReady, setIsRouterReady] = useState(false);
  const { id } = router.query;

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
      <ShowMovieDetail />
      <DateSelector onDateSelect={handleDateSelect} />
      <div className="mb-11 md:mx-[120px] md:mb-[80px] rounded-2">
        <div className="md:flex md:flex-row justify-between rounded md:gap-5 md:mt-20 flex-col py-10 px-4 md:py-0 md:px-0 space-y-5 md:space-y-0">
          <Input />
          <Select>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="city">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ShowTimes
          movieId={id}
          date={selectedDate ? selectedDate.fullDate : null}
        />
      </div>
      <FooterSection />
    </div>
  );
}
