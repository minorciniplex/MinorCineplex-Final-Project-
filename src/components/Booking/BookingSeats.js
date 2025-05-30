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
  const [isClient, setIsClient] = useState(false);

  // Use StatusContext instead of local auth state
  const { isLoggedIn, user, loading: authLoading } = useStatus();

  // Refs for cleanup
  const subscriptionRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Configuration
  const ROWS = ["E", "D", "C", "B", "A"];
  const SEATS_PER_ROW = 10;
  const PRICE_PER_SEAT = 150; // THB150

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize component
  useEffect(() => {
    if (showtimeId && !authLoading && isClient) {
      initializeSeats();
      loadLocalSelectedSeats();
    }

    return () => {
      cleanup();
    };
  }, [showtimeId, authLoading, isClient]);

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

      // Clean up any existing subscription/polling
      cleanup();

      // Try to set up real-time updates
      const success = await setupRealtimeSubscription();
      if (!success) {
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

  // Helper function to create the complete seat layout while preserving local selections
  const createCompleteSeatLayout = (
    existingSeats = [],
    preserveSelectedSeats = []
  ) => {
    const seatLayout = [];

    // Create a map of existing seats for quick lookup
    const existingSeatMap = existingSeats.reduce((map, seat) => {
      map[seat.id] = seat;
      return map;
    }, {});

    // Generate all seats for all rows
    for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex++) {
      const rowLabel = ROWS[rowIndex];
      for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
        const seatId = `${rowLabel}${seat + 1}`;

        // Use existing seat data if available, otherwise create available seat
        const existingSeat = existingSeatMap[seatId];
        if (existingSeat) {
          // If seat exists in database, use its status (booked/reserved)
          seatLayout.push(existingSeat);
        } else {
          // For seats not in database, check if they're locally selected
          const isLocallySelected = preserveSelectedSeats.includes(seatId);
          seatLayout.push({
            id: seatId,
            row: rowLabel,
            number: seat + 1,
            status: isLocallySelected ? "selected" : "available",
            reserved_by: null,
            reserved_until: null,
            showtime_id: showtimeId,
          });
        }
      }
    }

    return seatLayout;
  };

  const loadSeats = async () => {
    try {
      const response = await axios.get(`/api/seats/${showtimeId}`);

      // Always create complete seat layout, merging with existing data
      // and preserving currently selected seats
      const existingSeats = response.data || [];
      const completeSeatLayout = createCompleteSeatLayout(
        existingSeats,
        selectedSeats
      );

      setSeats(completeSeatLayout);
    } catch (err) {
      console.warn("Could not load existing seats, creating available seats");
      // If API call fails, create all seats as available but preserve selections
      const completeSeatLayout = createCompleteSeatLayout([], selectedSeats);
      setSeats(completeSeatLayout);
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      // Clean up any existing subscription first
      if (subscriptionRef.current) {
        await subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Create a unique channel name
      const channelName = `seats_showtime_${showtimeId}`;

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
          handleRealtimeUpdate
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Subscription error:", err);
          }
        });

      // Wait for subscription to establish
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 3000);

        const checkSubscription = () => {
          if (subscriptionRef.current?.state === "joined") {
            clearTimeout(timeout);
            resolve(true);
          } else {
            setTimeout(checkSubscription, 100);
          }
        };
        checkSubscription();
      });
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
      return false;
    }
  };

  const setupPollingFallback = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/seats/${showtimeId}`);
        const existingSeats = response.data || [];

        // Preserve current selections when polling
        setSeats((currentSeats) => {
          const currentSelectedSeats = currentSeats
            .filter((seat) => seat.status === "selected")
            .map((seat) => seat.id);
          return createCompleteSeatLayout(existingSeats, currentSelectedSeats);
        });
      } catch (error) {
        console.error("❌ Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    const seatId = newRecord?.seat_id || oldRecord?.seat_id;

    // Handle selectedSeats updates separately to avoid closure issues
    if (eventType === "INSERT" || eventType === "UPDATE") {
      const newStatus = newRecord?.seat_status;

      // If seat becomes booked/reserved, remove it from selectedSeats
      if (newStatus === "booked" || newStatus === "reserved") {
        setSelectedSeats((currentSelectedSeats) => {
          if (currentSelectedSeats.includes(seatId)) {
            const newSelected = currentSelectedSeats.filter(
              (id) => id !== seatId
            );
            saveLocalSelectedSeats(newSelected);

            return newSelected;
          }

          return currentSelectedSeats;
        });
      }
    }

    // Update seats array
    setSeats((currentSeats) => {
      const updatedSeats = [...currentSeats];
      const seatIndex = updatedSeats.findIndex((seat) => seat.id === seatId);

      if (eventType === "INSERT" || eventType === "UPDATE") {
        if (seatIndex >= 0) {
          const currentSeat = updatedSeats[seatIndex];
          const newStatus = newRecord.seat_status;

          // Always update the seat with the latest database status
          updatedSeats[seatIndex] = {
            ...currentSeat,
            status: newStatus,
            reserved_by: newRecord.reserved_by,
            reserved_until: newRecord.reserved_until,
          };
        } else if (newRecord) {
          // Add new seat if it doesn't exist - map Supabase format to component format

          updatedSeats.push({
            id: newRecord.seat_id,
            row: newRecord.row,
            number: newRecord.seat_number,
            status: newRecord.seat_status,
            reserved_by: newRecord.reserved_by,
            reserved_until: newRecord.reserved_until,
            showtime_id: newRecord.showtime_id,
          });
        }
      } else if (eventType === "DELETE" && seatIndex >= 0) {
        // Reset to available when deleted from database
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
  }, [selectedSeats, isLoggedIn]);

  useEffect(() => {
    if (onPriceChange) {
      onPriceChange(selectedSeats.length * PRICE_PER_SEAT);
    }
  }, [selectedSeats]);

  // Clear local storage when user authenticates
  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined") {
      localStorage.removeItem(`selectedSeats_${showtimeId}`);
    }
  }, [isLoggedIn, showtimeId]);

  // FIXED: Updated getSeatStatus function to handle race conditions properly
  const getSeatStatus = (seat) => {
    if (!seat) return "available";

    // CRITICAL FIX: Always prioritize database status for booked/reserved seats
    // regardless of authentication status
    if (seat.status === "booked" || seat.status === "reserved") {
      return seat.status;
    }

    // If seat is locally selected and not booked/reserved, show as selected
    if (selectedSeats.includes(seat.id)) {
      return "selected";
    }

    // Otherwise show available
    return "available";
  };

  // Show loading while auth is being checked or component is mounting
  if (!isClient || authLoading || loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">
              {!isClient
                ? "Initializing..."
                : authLoading
                ? "Checking authentication..."
                : "Loading seats..."}
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
