import { useState, useEffect, useRef } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DateSelector({ onDateSelect }) {
  const [dates, setDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Generate 14 days starting from today
  useEffect(() => {
    const generateDates = () => {
      const dateArray = [];

      for (let i = 0; i < 14; i++) {
        const currentDate = addDays(new Date(), i);

        dateArray.push({
          dayName: i === 0 ? "Today" : format(currentDate, "EEE"),
          day: format(currentDate, "d"),
          month: format(currentDate, "MMM"),
          year: format(currentDate, "yyyy"),
          fullDate: format(currentDate, "yyyy-MM-dd"),
        });
      }

      return dateArray;
    };

    const initialDates = generateDates();
    setDates(initialDates);

    if (onDateSelect && initialDates.length > 0) {
      onDateSelect(initialDates[0]);
    }
  }, [onDateSelect]);

  const handleDateSelect = (index) => {
    setSelectedDateIndex(index);
    if (onDateSelect) {
      onDateSelect(dates[index]);
    }
  };

  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsAtStart(el.scrollLeft <= 0);
    setIsAtEnd(el.scrollLeft + el.offsetWidth >= el.scrollWidth - 1);
  };

  const scrollDates = (direction) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 220;
    if (direction === "left") {
      scrollContainerRef.current.scrollLeft -= scrollAmount;
    } else {
      scrollContainerRef.current.scrollLeft += scrollAmount;
    }

    setTimeout(checkScrollPosition, 100);
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (dates.length === 0) {
    return (
      <div className="flex justify-center items-center h-16 bg-background">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[var(--base-gray-0)]">
      {!isAtStart && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => scrollDates("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {/* ⬇️ Outer container for padding/alignment */}
      <div className="flex justify-center items-center p-4 md:py-4 md:px-10 ">
        {/* ⬇️ Bordered scroll container box */}
        <div className="w-[100vw] md:w-[80vw] overflow-hidden">
          {/* ⬇️ Actual horizontal scrolling area inside the border box */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((date, index) => (
              <Card
                key={index}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center py-2 px-4 w-[120px] md:w-[180px] cursor-pointer rounded-md bg-transparent text-white",
                  selectedDateIndex === index
                    ? "ring-2 ring-primary bg-[--base-gray-100]"
                    : "hover:bg-[--base-gray-100]"
                )}
                onClick={() => handleDateSelect(index)}
              >
                <div
                  className={cn(
                    "text-2xl font-bold",
                    selectedDateIndex === index
                      ? "text-[--base-white]"
                      : "text-[--base-gray-300]"
                  )}
                >
                  {date.dayName}
                </div>
                <div
                  className={cn(
                    "text-base font-normal",
                    selectedDateIndex === index
                      ? "text-[--base-gray-400]"
                      : "text-[--base-gray-200]"
                  )}
                >
                  {date.day} {date.month} {date.year}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {!isAtEnd && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => scrollDates("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
