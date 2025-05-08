import { useRouter } from "next/router";
import CinemaDetailCard from "@/components/CinemaDetailCard";
import DateSelector from "@/components/DateSelector";

export default function CinemaPage() {
  const router = useRouter();
  const { id } = router.query;

  const handleDateSelect = (date) => {
    console.log("Selected date:", date);
    // Fetch showtimes for the selected date
  };

  return (
    <main>
      <div className="relative w-full h-[580px] overflow-hidden">
        {/* Background image */}
        <img
          src="/images/cinema/hero-bg-movie.jpg"
          alt="Cinema background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Hero Card */}
        {id && <CinemaDetailCard cinemaId={id} />}
      </div>

      {/* Date Selector */}
      <DateSelector onDateSelect={handleDateSelect} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Now Showing</h2>

        {/* Movies grid would go here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Movie cards would go here */}
          <div className="bg-gray-100 p-4 rounded-lg h-64 flex items-center justify-center">
            Movie card placeholder
          </div>
          <div className="bg-gray-100 p-4 rounded-lg h-64 flex items-center justify-center">
            Movie card placeholder
          </div>
          <div className="bg-gray-100 p-4 rounded-lg h-64 flex items-center justify-center">
            Movie card placeholder
          </div>
        </div>
      </div>
    </main>
  );
}
