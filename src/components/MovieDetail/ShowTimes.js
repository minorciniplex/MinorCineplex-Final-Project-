import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import ShowtimeButtons from "@/components/MovieDetail/ShowTimeButtons";
import { useRouter } from "next/router";
import axios from "axios";

export default function ShowTimes({ showtimes, date }) {
  const [openItems, setOpenItems] = useState([]);
  const router = useRouter();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const { movieId } = router.query;


  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const controller = new AbortController();
        const response = await axios.get(
          `/api/movies-detail/getMoviesDetail?id=${movieId}`,
          {
            signal: controller.signal,
            timeout: 10000,
          }
        );

        if (response.status !== 200 || !response.data.data) {
          throw new Error("Failed to fetch movie details");
        }
        setMovie(response.data.data);
        return () => controller.abort();
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled");
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

useEffect(() => {
  setOpenItems((prev) => {
    const newKeys = showtimes.map((_, index) => `item-${index}`);
    const added = newKeys.filter(key => !prev.includes(key));
    return [...prev, ...added];
  });
}, [showtimes]);


  const handleSelect = ({ time, screenNumber, cinemaName, date}) => {
    // ตัวอย่างการ push ไปหน้าจองตั๋ว
    const query = new URLSearchParams({
      poster: movie.poster_url,
      title: movie.title,
      genres: JSON.stringify(movie.movie_genre_mapping), // แปลง object เป็น string
      language: JSON.stringify(movie.original_language),
      time: time.time,
      screenNumber,
      cinemaName,
      date,
      movieId: movieId,
      showtimeId: showtimes[0].showtimeId


    }).toString();

    router.push(`/booking/seats/seat?${query}`);
  };

  return (
    <div>
      <div className="md:mt-10">
        <Accordion
          key={date + JSON.stringify(showtimes)}
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
                            date: showtimes[0].date,
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
