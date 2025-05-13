// components/ShowtimeButtons.js
import React from "react";

// Utility to check if a showtime is in the past
const isPastShowtime = (timeString, dateString) => {
  const now = new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.substring(0, 5).split(":").map(Number);

  const showtimeDate = new Date(year, month - 1, day, hours, minutes);
  return showtimeDate < now;
};

// Utility to check if a showtime is more than X minutes in the past
const isPastShowtimeByMinutes = (timeString, dateString, minutes) => {
  const now = new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes1] = timeString.substring(0, 5).split(":").map(Number);

  const showtimeDate = new Date(year, month - 1, day, hours, minutes1);
  const timeThreshold = new Date(now.getTime() - minutes * 60 * 1000);

  return showtimeDate < timeThreshold;
};

const ShowtimeButtons = ({ times = [], date, movie, hall, onSelect }) => {
  const sortedTimes = [...times].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-wrap gap-6">
      {sortedTimes.map((time, i) => {
        // If date is not today, apply regular styling to all showtimes
        if (date.dayName !== "Today") {
          let buttonClass =
            "px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-xl rounded-md flex items-center justify-center font-medium text-white bg-[var(--brand-blue-200)] text-white hover:bg-[var(--brand-blue-100)] transition";

          return (
            <button
              key={i}
              className={buttonClass}
              onClick={() => {
                console.log(`Selected: ${movie?.title} at ${time} in ${hall}`);
              }}
            >
              {time}
            </button>
          );
        }

        const hasRecentPastShowtime = sortedTimes.some(
          (t) =>
            isPastShowtime(t, date.fullDate) &&
            !isPastShowtimeByMinutes(t, date.fullDate, 30)
        );

        const firstFutureIndex = sortedTimes.findIndex(
          (t) => !isPastShowtime(t, date.fullDate)
        );

        const isPastThirtyMins = isPastShowtimeByMinutes(
          time,
          date.fullDate,
          30
        );
        const isPast = isPastShowtime(time, date.fullDate);
        const isWithinThirtyMinsPast = isPast && !isPastThirtyMins;

        const shouldHighlight =
          isWithinThirtyMinsPast ||
          (!hasRecentPastShowtime && i === firstFutureIndex);

        let buttonClass =
          "px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-xl rounded-md flex items-center justify-center font-medium text-white";

        if (isPast && !isWithinThirtyMinsPast) {
          buttonClass +=
            " bg-transparent text-[var(--base-gray-200)] border border-[var(--base-gray-200)] cursor-not-allowed";
        } else if (shouldHighlight) {
          buttonClass +=
            " bg-[var(--brand-blue-100)] text-white hover:bg-[var(--brand-blue-300)] transition";
        } else {
          buttonClass +=
            " bg-[var(--brand-blue-200)] text-white hover:bg-[var(--brand-blue-100)] transition";
        }

        return (
          <button
            key={i}
            className={buttonClass}
            disabled={isPast && !isWithinThirtyMinsPast}
            onClick={() => {
              if (onSelect) {
                onSelect({ time, movie, hall });
              }
            }}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
};

export default ShowtimeButtons;
