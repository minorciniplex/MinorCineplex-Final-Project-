import { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { set } from "date-fns";


export default function ShowTimes() {
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await axios.get("/api/movies-detail/getShowTimes", {
          params: {
            movieId: "013b897b-3387-4b7f-ab23-45b78199020a",
            date: "2025-05-14",
          },
        });
        
        // Group showtimes by cinema and screen
        const groupedData = groupShowtimesByCinemaAndScreen(response.data.data);
        setShowtimes(groupedData);

        
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    };

    fetchShowtimes();
  }, []);

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
  console.log("showtimes", showtimes);

return (
    <div>
        <div className="p-6">
            <Accordion type="single" collapsible className="space-y-4">
                {showtimes.map((cinema, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="bg-gray-900 rounded-lg"
                    >
                        <AccordionTrigger className="px-6 py-4 text-white hover:no-underline">
                            {cinema.name}
                            {cinema.facilities && cinema.facilities.length > 0 && (
                                <span className="ml-4 text-sm text-gray-400">
                                    {cinema.facilities.map((facility, i) => (
                                        <span key={i}>
                                            {facility}
                                            {i < cinema.facilities.length - 1 && ", "}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            {Object.entries(cinema.screens).map(
                                ([screenNumber, times], hallIndex) => (
                                    <div key={hallIndex} className="mb-4">
                                        <h3 className="text-gray-300 px-4 py-2">{screenNumber}</h3>
                                        <div className="flex gap-4 overflow-x-auto px-4 pb-2">
                                            {times.map((time, timeIndex) => (
                                                <button
                                                    key={timeIndex}
                                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
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
