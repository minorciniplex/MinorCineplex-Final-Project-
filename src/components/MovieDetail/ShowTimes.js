import { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

export default function ShowTimes({ movieId, date }) {
  const [showtimes, setShowtimes] = useState([]);
  const [openItems, setOpenItems] = useState([]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        if (!movieId || !date) {
          console.log("Missing required parameters:", { movieId, date });
          return;
        }

        const response = await axios.get("/api/movies-detail/getShowTimes", {
          params: {
            movieId: movieId,
            date: date,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data && response.data.data) {
          const groupedData = groupShowtimesByCinemaAndScreen(
            response.data.data
          );
          setShowtimes(groupedData);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (err) {
        console.error(
          "Error fetching showtimes:",
          err.response?.data || err.message
        );
        setShowtimes([]);
      }
    };

    fetchShowtimes();
  }, [movieId, date]);

  useEffect(() => {
    const allItems = showtimes.map((_, index) => `item-${index}`);
    setOpenItems(allItems);
  }, [showtimes]);

  // Function to group showtimes by cinema and screen
  const groupShowtimesByCinemaAndScreen = (data) => {
    const cinemaMap = new Map();

    data.forEach((showtime) => {
      const cinemaName = showtime.screens.cinemas.name;
      const screenNumber = showtime.screens.screen_number;
      const facilities = showtime.screens.cinemas.facilities;
      const key = cinemaName;

      if (!cinemaMap.has(key)) {
        cinemaMap.set(key, {
          name: cinemaName,
          facilities: facilities,
          screens: {},
        });
      }

      const cinema = cinemaMap.get(key);
      if (!cinema.screens[screenNumber]) {
        cinema.screens[screenNumber] = [];
      }

      cinema.screens[screenNumber].push({
        startTime: showtime.start_time,
        date: showtime.date,
      });
    });

    return Array.from(cinemaMap.values());
  };

  // Format time from "HH:MM:SS" to "HH:MM"
  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getButtonColorClass = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(":");
    const showTime = new Date();
    showTime.setHours(parseInt(hours));
    showTime.setMinutes(parseInt(minutes));

    // คำนวณเวลาที่ต่างกันเป็นนาที
    const diffInMinutes = (showTime - now) / (1000 * 60);

    if (diffInMinutes < 0) {
      // เวลาผ่านไปแล้ว
      return "border border-[--base-gray-200] cursor-not-allowed ";
    } else if (diffInMinutes <= 90) {
      // ใกล้ถึงเวลาฉาย (60 นาทีหรือน้อยกว่า)
      return "bg-[--brand-blue-100] hover:bg-[--brand-blue-200] ";
    } else if (diffInMinutes > 90) {
      // เพิ่มเงื่อนไขสำหรับเวลามากกว่า 1 ชั่วโมง
      // เวลาที่มากกว่า 1 ชั่วโมง
      return "bg-[--brand-blue-200] hover:bg-[--brand-blue-100]";
    }
  };

  return (
    <div>
      <div className="mt-5 md:mt-10">
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          collapsible
          className="space-y-4 md:space-y-6 text-xl md:text-2xl"
        >
          {showtimes.map((cinema, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[--base-gray-100] rounded-lg"
            >
              <AccordionTrigger className="p-4 font-base hover:no-underline">
                <div className="flex flex-col md:flex-row md:items-center w-full">
                  <span className="text-2xl font-bold">{cinema.name}</span>
                  {cinema.facilities && cinema.facilities.length > 0 && (
                    <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-5 mt-5 md:mt-0 md:ml-5">
                      {cinema.facilities.map((facility, i) => (
                        <div
                          key={i}
                          className="px-3 py-[6px] md:px-3 md:py-[6px] bg-[--base-gray-100] text-sm font-normal text-[--base-gray-300] rounded"
                        >
                          {facility}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-8 md:space-y-[60px] py-6 px-4 md:p-6">
                {Object.entries(cinema.screens).map(
                  ([screenNumber, times], hallIndex) => (
                    <div key={hallIndex}>
                      <h3 className="text-[--base-gray-400] text-2xl font-bold mb-4 gap-4 md:mb-4">
                        Hall {screenNumber}
                      </h3>
                      <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 overflow-x-auto">
                        {times.map((time, timeIndex) => (
                          <button
                            key={timeIndex}
                            className={`px-[28px] md:px-10 py-3 md:py-3 text-white text-xl md:text-base font-bold rounded-sm transition-colors ${getButtonColorClass(
                              time.startTime
                            )}`}
                          >
                            {formatTime(time.startTime)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
