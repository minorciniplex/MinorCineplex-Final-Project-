import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "@/utils/supabase";
import AvailableIcon from "../Seats/Seat_Available";
import BookedIcon from "../Seats/Seat_Booked";
import ReservedIcon from "../Seats/Seat_Reserved";
import SelectedIcon from "../Seats/Seat_Selected";
import { useStatus } from "@/context/StatusContext";

function BookingSeats({
  showtimeId,
  onSeatsChange,
  onPriceChange,
  price,
  onBookingIdChange,
}) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [userReservedSeats, setUserReservedSeats] = useState([]);
  const [currentBookingId, setCurrentBookingId] = useState(null);
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
  const PRICE_PER_SEAT = price;

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

  // Load user's existing reservations
  const loadUserReservations = async () => {
    if (!isLoggedIn || !user) return;

    try {
      // Load user's current reservations for this showtime
      const response = await axios.get(
        `/api/seats/${showtimeId}/user-reservations`
      );
      const userReservations = response.data || [];

      if (userReservations.length > 0) {
        const reservedSeatIds = userReservations.map((seat) => seat.seat_id);
        const bookingId = userReservations[0]?.booking_id;

        setUserReservedSeats(reservedSeatIds);
        setCurrentBookingId(bookingId);
        // FIXED: Ensure user's reserved seats are treated as selected
        setSelectedSeats(reservedSeatIds);

        // Notify parent about the existing booking ID
        if (onBookingIdChange && bookingId) {
          onBookingIdChange(bookingId);
        }
      }
    } catch (error) {
      console.error("Error loading user reservations:", error);
    }
  };

  const initializeSeats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load seats first
      await loadSeats();

      // Load user's existing reservations
      await loadUserReservations();

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
    }, 2000);
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    const seatId = newRecord?.seat_id || oldRecord?.seat_id;

    // IMPROVED: Handle real-time updates while preserving user's own reservations
    if (eventType === "INSERT" || eventType === "UPDATE") {
      const newStatus = newRecord?.seat_status;
      const reservedBy = newRecord?.reserved_by;

      // If seat becomes booked/reserved by someone else (not current user), remove it from selectedSeats
      if (
        (newStatus === "booked" || newStatus === "reserved") &&
        reservedBy !== user
      ) {
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

        // Also remove from user reserved seats if it was there
        setUserReservedSeats((current) =>
          current.filter((id) => id !== seatId)
        );
      }
      
      // FIXED: If seat is reserved by current user, ensure it stays in selectedSeats
      if (newStatus === "reserved" && reservedBy === user) {
        setSelectedSeats((currentSelectedSeats) => {
          if (!currentSelectedSeats.includes(seatId)) {
            return [...currentSelectedSeats, seatId];
          }
          return currentSelectedSeats;
        });
        
        setUserReservedSeats((current) => {
          if (!current.includes(seatId)) {
            return [...current, seatId];
          }
          return current;
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

    // FIXED: Allow clicking on user's own reserved seats using user.id
    // Block clicking ONLY on booked seats or seats reserved by OTHER users
    if (!seat || seat.status === "booked") {
      return;
    }

    // If seat is reserved, only allow if it's the user's own reservation
    if (seat.status === "reserved") {
      const isUserOwnReservation = userReservedSeats.includes(seatId) || 
                                  seat.reserved_by === user?.id;
      
      if (!isUserOwnReservation) {
        return;
      }
    }

    const isCurrentlySelected = selectedSeats.includes(seatId);
    const isUserReserved = userReservedSeats.includes(seatId);

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

      // If this was a user reserved seat, remove it from that list too
      if (isUserReserved) {
        setUserReservedSeats((current) =>
          current.filter((id) => id !== seatId)
        );
      }
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
        setSelectedSeats(selectedSeats);
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

    return {
      canProceed: true,
      selectedSeats: selectedSeats,
      existingBookingId: currentBookingId,
    };
  };

  // Expose this method to parent component
  useEffect(() => {
    if (onSeatsChange) {
      onSeatsChange({
        seats: selectedSeats,
        canProceed: canProceedToBooking,
      });
    }
  }, [selectedSeats, isLoggedIn, currentBookingId]);

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

  // FIXED: Updated getSeatStatus function to always show user's reserved seats as selected
  const getSeatStatus = (seat) => {
    if (!seat) return "available";

    // If seat is booked, always show as booked
    if (seat.status === "booked") {
      return "booked";
    }

    // FIXED: If seat is reserved by current user OR is in selectedSeats, show as selected
    // This ensures user's reserved seats appear as selected (allowing modification)
    if (
      (seat.status === "reserved" && seat.reserved_by === user) ||
      selectedSeats.includes(seat.id)
    ) {
      return "selected";
    }

    // If seat is reserved by someone else, show as reserved
    if (seat.status === "reserved" && seat.reserved_by !== user) {
      return "reserved";
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
      <div className="w-full bg-[--background] md:bg-transparent md:basis-3/4 py-10 px-4 md:py-0 md:px-0">
        <div className="bg-gradient-to-r from-[#2C344E] to-[#516199] rounded-t-[80px] items-center flex justify-center text-[7.47px] md:text-base py-[4.67px] md:py-[10px] text-[--base-gray-400]">
          screen
        </div>

        {/* Seat Layout */}
        <div className="flex flex-col gap-4 md:gap-[30px] items-center mt-[28px] md:my-[60px]">
          {ROWS.map((rowLabel) => {
            const rowSeats = seats.filter((seat) => seat.row === rowLabel);
            return (
              <div
                key={rowLabel}
                className="flex flex-row text-[7.47px] md:text-base text-[--base-gray-300] items-center gap-10 md:gap-[138px]"
              >
                {/* Left Row Label */}
                <div className="flex flex-row gap-[11.2px] md:gap-6 items-center">
                  <span className="text-left font-bold">{rowLabel}</span>
                  {rowSeats.slice(0, 5).map((seat) => {
                    const displayStatus = getSeatStatus(seat);
                    return (
                      <div
                        key={seat.id}
                        className="rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <div>
                          {displayStatus === "available" && (
                            <div>
                              <AvailableIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                            </div>
                          )}
                          {displayStatus === "selected" && (
                            <SelectedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
                          {displayStatus === "booked" && (
                            <BookedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
                          {displayStatus === "reserved" && (
                            <ReservedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Section Seats */}
                <div className="flex flex-row gap-[11.2px] md:gap-6 items-center">
                  {rowSeats.slice(5, 10).map((seat) => {
                    const displayStatus = getSeatStatus(seat);
                    return (
                      <div
                        key={seat.id}
                        className="rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <div>
                          {displayStatus === "available" && (
                            <div>
                              <AvailableIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                            </div>
                          )}
                          {displayStatus === "selected" && (
                            <SelectedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
                          {displayStatus === "booked" && (
                            <BookedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
                          {displayStatus === "reserved" && (
                            <ReservedIcon className="w-[18.67px] h-[18.67px] md:w-10 md:h-10" />
                          )}
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 border-t-2 border-[--base-gray-100] pt-2 md:py-4 mt-7 md:mt-0">
          <div className="bg-[--base-gray-100] rounded-md py-3 px-4 text-[--base-gray-400] text-2xl font-bold items-center w-[88px]">
            Hall 1
          </div>
          <div className="grid grid-cols-2 md:flex md:gap-10 md:grid-cols-none gap-y-8 gap-x-8 md:gap-y-0 text-[--base-gray-400]">
            <div className="flex flex-row md:flex-wrap gap-4 items-center">
              <AvailableIcon />
              <p className="basis-24">Available Seat THB{price}</p>
            </div>
            <div className="flex flex-row md:flex-wrap gap-4 items-center">
              <BookedIcon />
              <p>Booked Seat</p>
            </div>
            <div className="flex flex-row md:flex-wrap gap-4 items-center">
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
