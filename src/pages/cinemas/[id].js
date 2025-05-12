import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import CinemaDetailCard from "@/components/Cinemas/CinemaDetailCard";
import DateSelector from "@/components/DateSelector";
import ShowtimeCard from "@/components/Cinemas/ShowtimeCard";
import Image from "next/image";

export default function CinemaPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const { id } = router.query;

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Use effect to handle initial page load when router isn't ready yet
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);

  // Don't render content that depends on router query until router is ready
  if (!isRouterReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main>
      <div className="relative w-full h-[580px] overflow-hidden">
        {/* Background image */}
        <Image
          fill
          src="/images/cinema/hero-bg-movie.jpg"
          alt="Cinema background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Hero Card */}
        {id && <CinemaDetailCard cinemaId={id} />}
      </div>

      {/* Date Selector */}
      <DateSelector onDateSelect={handleDateSelect} />

      {/* Showtime Cards */}
      <div className="py-[80px] px-[120px]">
      {id && (
        <ShowtimeCard
          cinemaId={id}
          date={selectedDate ? selectedDate.fullDate : null}
        />
      )}
      </div>
    </main>
  );
}
