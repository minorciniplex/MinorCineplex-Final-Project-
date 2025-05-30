import { useRouter } from "next/router";
import StepProgressBar from "@/components/Booking/StepProgressBar";
import Navbar from "@/components/Navbar/Navbar";

function SeatsSelection() {
  const router = useRouter();

  return (
    <div>
      <div className="w-full h-[80px]">
        <Navbar />
      </div>
      <StepProgressBar currentPath={router.pathname} />
      <h1>Select Your Seats</h1>
      {/* Seat selection UI goes here */}
    </div>
  );
}
export default SeatsSelection;
