import { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import ShowtimeButtons from "@/components/MovieDetail/ShowTimeButtons";

export default function ShowTimes({ movieId, date, name, cityName }) {
  const [showtimes, setShowtimes] = useState([]);
  const [openItems, setOpenItems] = useState([]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        if (!movieId || !date) {
          return;
        }

        const response = await axios.get("/api/movies-detail/getShowTimes", {
          params: {
            movieId: movieId,
            date: date,
            name: name,
            province: cityName,
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
  }, [movieId, date, name, cityName]);

  useEffect(() => {
    const allItems = showtimes.map((_, index) => `item-${index}`);
    setOpenItems(allItems);
  }, [showtimes]);

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

      cinema.screens[screenNumber].push(showtime.start_time.substring(0, 5));
    });

    return Array.from(cinemaMap.values());
  };

  return (
    <div>
      <div className="md:mt-10">
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
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
                  <div className="flex items-center text-2xl font-bold">
                    <div className="w-12 h-12 bg-[--base-gray-100] rounded-full flex items-center justify-center mr-5">
                      <FmdGoodIcon className="text-[--brand-blue-100] w-6 h-6 basis-12" />
                    </div>
                    <span>{cinema.name}</span>
                  </div>
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
              <AccordionContent className="space-y-8 md:space-y-[60px] py-6 px-4 md:py-0 md:px-0">
                {Object.entries(cinema.screens).map(
                  ([screenNumber, times], hallIndex) => (
                    <div key={hallIndex}>
                      <h3 className="text-[--base-gray-400] text-2xl font-bold mb-4 gap-4 md:mb-4">
                        Hall {screenNumber}
                      </h3>
                      <ShowtimeButtons
                        times={times}
                        date={date}
                        screenNumber={screenNumber}
                        cinemaName={cinema.name}
                        onSelect={(time) => {
                          handleSelect({
                            time,
                            screenNumber,
                            cinemaName: cinema.name,
                          });
                        }}
                      />
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
