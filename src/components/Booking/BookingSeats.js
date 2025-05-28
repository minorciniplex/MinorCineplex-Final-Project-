import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "@/utils/supabase";
import AvailableIcon from "../Seats/Seat_Available";
import BookedIcon from "../Seats/Seat_Booked";
import ReservedIcon from "../Seats/Seat_Reserved";
import SelectedIcon from "../Seats/Seat_Selected";
import { useStatus } from "@/context/StatusContext";

function BookingSeats({ showtimeId, onSeatsChange, onPriceChange }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use StatusContext instead of local auth state
  const { isLoggedIn, user, loading: authLoading } = useStatus();

  // Refs for cleanup
  const subscriptionRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Configuration
  const ROWS = ["E", "D", "C", "B", "A"];
  const SEATS_PER_ROW = 10;
  const PRICE_PER_SEAT = 150; // THB150

  // Initialize component
  useEffect(() => {
    if (showtimeId && !authLoading) {
      // Wait for auth to load
      initializeSeats();
      // Load any previously selected seats for unauthenticated users
      loadLocalSelectedSeats();
    }

    return () => {
      cleanup();
    };
  }, [showtimeId, authLoading]); // Add authLoading dependency

  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const loadLocalSelectedSeats = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`selectedSeats_${showtimeId}`);
      if (stored) {
        try {
          const parsedSeats = JSON.parse(stored);
          setSelectedSeats(parsedSeats);
        } catch (error) {
          console.error("Error loading stored seats:", error);
        }
      }
    }
  };

  const saveLocalSelectedSeats = (seats) => {
    if (typeof window !== "undefined" && !isLoggedIn) {
      localStorage.setItem(
        `selectedSeats_${showtimeId}`,
        JSON.stringify(seats)
      );
    }
  };

  const initializeSeats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load seats first
      await loadSeats();

      // Try to set up real-time updates
      const { success: realtimeSuccess } = await setupRealtimeSubscription();
      if (!realtimeSuccess) {
        console.warn("Real-time updates unavailable - falling back to polling");
        setupPollingFallback();
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setError("Failed to load seats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async () => {
    try {
      const response = await axios.get(`/api/seats/${showtimeId}`);

      if (!response.data || response.data.length === 0) {
        console.log(
          "No seats found for this showtime, initializing empty seats"
        );
        initializeEmptySeats();
        return;
      }

      setSeats(response.data);
    } catch (err) {
      console.warn("Could not load existing seats, initializing empty seats");
      initializeEmptySeats();
    }
  };

  const initializeEmptySeats = () => {
    const seatLayout = [];
    for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex++) {
      const rowLabel = ROWS[rowIndex];
      for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
        seatLayout.push({
          id: `${rowLabel}${seat + 1}`,
          row: rowLabel,
          number: seat + 1,
          status: "available",
          reserved_by: null,
          reserved_until: null,
          showtime_id: showtimeId,
        });
      }
    }
    console.log("Created seat layout:", seatLayout);
    setSeats(seatLayout);
  };

  const setupRealtimeSubscription = async () => {
    try {
      // Use your existing auth state instead of checking Supabase directly
      const needsAuth = !isLoggedIn;

      console.log(
        needsAuth
          ? "No authenticated session - using public subscription"
          : "Using authenticated subscription"
      );

      // Use public channel for unauthenticated users
      const channelName = needsAuth
        ? `seats_public_${showtimeId}`
        : `seats_${showtimeId}`;

      subscriptionRef.current = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "seats",
            filter: `showtime_id=eq.${showtimeId}`,
          },
          (payload) => {
            console.log("Real-time seat update:", payload);
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to seat updates");
          } else if (status === "CLOSED") {
            console.log("Subscription closed");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Subscription error:", err);
            setupPollingFallback();
          }
        });

      return { success: true, needsAuth };
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
      return { success: false, needsAuth: true };
    }
  };

  const setupPollingFallback = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/seats/${showtimeId}`);
        if (response.data) {
          setSeats(response.data);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setSeats((currentSeats) => {
      const updatedSeats = [...currentSeats];
      const seatIndex = updatedSeats.findIndex(
        (seat) => seat.id === (newRecord?.id || oldRecord?.id)
      );

      if (eventType === "INSERT" || eventType === "UPDATE") {
        if (seatIndex >= 0) {
          updatedSeats[seatIndex] = newRecord;
        } else {
          updatedSeats.push(newRecord);
        }
      } else if (eventType === "DELETE" && seatIndex >= 0) {
        updatedSeats[seatIndex] = {
          ...updatedSeats[seatIndex],
          status: "available",
          reserved_by: null,
          reserved_until: null,
        };
      }

      return updatedSeats;
    });
  };

  const handleSeatClick = async (seatId) => {
    const seat = seats.find((s) => s.id === seatId);

    // Disable click for booked and reserved seats
    if (!seat || seat.status === "booked" || seat.status === "reserved") {
      return;
    }

    const isCurrentlySelected = selectedSeats.includes(seatId);

    // Optimistically update UI first
    setSeats((currentSeats) => {
      return currentSeats.map((seat) => {
        if (seat.id === seatId) {
          const newStatus = isCurrentlySelected ? "available" : "selected";
          return { ...seat, status: newStatus };
        }
        return seat;
      });
    });

    // Update selectedSeats state
    let newSelectedSeats;
    if (isCurrentlySelected) {
      newSelectedSeats = selectedSeats.filter((id) => id !== seatId);
    } else {
      newSelectedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(newSelectedSeats);

    // Save to localStorage for unauthenticated users
    saveLocalSelectedSeats(newSelectedSeats);

    // If user is authenticated, you might want to save selections to server
    // This is optional depending on your requirements
    if (isLoggedIn) {
      try {
        // Optional: Save selection to server for authenticated users
        // await axios.post(`/api/seats/${showtimeId}/select`, {
        //   seatId,
        //   selected: !isCurrentlySelected,
        //   userId: user
        // });
      } catch (error) {
        console.error("Error saving seat selection:", error);
        // Revert optimistic update on error
        setSeats((currentSeats) => {
          return currentSeats.map((seat) => {
            if (seat.id === seatId) {
              const revertedStatus = !isCurrentlySelected
                ? "available"
                : "selected";
              return { ...seat, status: revertedStatus };
            }
            return seat;
          });
        });
        setSelectedSeats(selectedSeats); // Revert to previous state
      }
    }
  };

  // Method to check if user can proceed (called by parent component)
  const canProceedToBooking = async () => {
    if (selectedSeats.length === 0) {
      return { canProceed: false, reason: "No seats selected" };
    }

    if (!isLoggedIn) {
      return {
        canProceed: false,
        reason: "authentication_required",
        selectedSeats: selectedSeats,
      };
    }

    return { canProceed: true, selectedSeats: selectedSeats };
  };

  // Expose this method to parent component
  useEffect(() => {
    if (onSeatsChange) {
      onSeatsChange({
        seats: selectedSeats,
        canProceed: canProceedToBooking,
      });
    }
  }, [selectedSeats]); // Only depend on selectedSeats

  useEffect(() => {
    if (onPriceChange) {
      onPriceChange(selectedSeats.length * PRICE_PER_SEAT);
    }
  }, [selectedSeats]); // Only depend on selectedSeats

  // Clear local storage when user authenticates
  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined") {
      localStorage.removeItem(`selectedSeats_${showtimeId}`);
    }
  }, [isLoggedIn, showtimeId]);

  const getSeatStatus = (seat) => {
    if (!seat) return "available";

    // Override status for locally selected seats (for unauthenticated users)
    if (!isLoggedIn && selectedSeats.includes(seat.id)) {
      return "selected";
    }

    return seat.status;
  };

  // Show loading while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">
              {authLoading ? "Checking authentication..." : "Loading seats..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => initializeSeats()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full sm:basis-3/4 py-10 px-4 sm:py-0 sm:px-0">
        <div className="bg-gradient-to-r from-[#2C344E] to-[#516199] rounded-t-[80px] items-center flex justify-center text-[8px] sm:text-base py-[4.67px] sm:py-[10px] text-[--base-gray-400]">
          screen
        </div>

        {/* Seat Layout */}
        <div className="flex flex-col gap-4 sm:gap-[30px] items-center mt-[28px] sm:my-[60px]">
          {ROWS.map((rowLabel) => {
            const rowSeats = seats.filter((seat) => seat.row === rowLabel);
            return (
              <div
                key={rowLabel}
                className="flex flex-row text-[7.47px] sm:text-base text-[--base-gray-300] items-center gap-9 sm:gap-[138px]"
              >
                {/* Left Row Label */}
                <div className="flex flex-row gap-3 sm:gap-6 items-center">
                  <span className="text-left font-bold">{rowLabel}</span>
                  {rowSeats.slice(0, 5).map((seat) => {
                    const displayStatus = getSeatStatus(seat);
                    return (
                      <div
                        key={seat.id}
                        className="w-[18.6px] h-[18.6px] sm:w-10 sm:h-10 rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <div className="w-full h-full">
                          {displayStatus === "available" && (
                            <div className="w-full h-full">
                              <AvailableIcon />
                            </div>
                          )}
                          {displayStatus === "selected" && <SelectedIcon />}
                          {displayStatus === "booked" && <BookedIcon />}
                          {displayStatus === "reserved" && <ReservedIcon />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Section Seats */}
                <div className="flex flex-row gap-3 sm:gap-6 items-center">
                  {rowSeats.slice(5, 10).map((seat) => {
                    const displayStatus = getSeatStatus(seat);
                    return (
                      <div
                        key={seat.id}
                        className="w-[18.6px] h-[18.6px] sm:w-10 sm:h-10 rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <div className="w-full h-full">
                          {displayStatus === "available" && (
                            <div className="w-full h-full">
                              <AvailableIcon />
                            </div>
                          )}
                          {displayStatus === "selected" && <SelectedIcon />}
                          {displayStatus === "booked" && <BookedIcon />}
                          {displayStatus === "reserved" && <ReservedIcon />}
                        </div>
                      </div>
                    );
                  })}
                  <span className="text-right font-bold">{rowLabel}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seat Status Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 border-t-2 border-[--base-gray-100] pt-2 sm:py-4 mt-7 sm:mt-0">
          <div className="bg-[--base-gray-100] rounded-sm py-3 px-4 text-[--base-gray-400] text-2xl font-bold items-center w-[88px]">
            Hall 1
          </div>
          <div className="grid grid-cols-2 sm:flex sm:gap-10 sm:grid-cols-none gap-y-8 gap-x-8 sm:gap-y-0 text-[--base-gray-400]">
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <AvailableIcon />
              <p className="basis-24">Available Seat THB150</p>
            </div>
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <BookedIcon />
              <p>Booked Seat</p>
            </div>
            <div className="flex flex-row sm:flex-wrap gap-4 items-center">
              <ReservedIcon />
              <p>Reserved Seat</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingSeats;
