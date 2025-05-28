import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "@/utils/supabase";

const SeatSelection = ({ 
  showtimeId, 
  onSeatsChange, 
  onPriceChange,
  className = "" 
}) => {
  // State management
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const subscriptionRef = useRef(null);

  // Configuration
  const ROWS = 5;
  const SEATS_PER_ROW = 10;
  const PRICE_PER_SEAT = 150; // THB150

  // Initialize component
  useEffect(() => {
    if (showtimeId) {
      initializeSeats();
    }

    return () => {
      // Cleanup subscriptions
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [showtimeId]);

  // Update parent component when selected seats change
  useEffect(() => {
    if (onSeatsChange) {
      onSeatsChange(selectedSeats);
    }
    if (onPriceChange) {
      onPriceChange(selectedSeats.length * PRICE_PER_SEAT);
    }
  }, [selectedSeats, onSeatsChange, onPriceChange]);

  const initializeSeats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSeats(), 
        setupRealtimeSubscription()
      ]);
    } catch (err) {
      setError("Failed to load seats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async () => {
    try {
      const response = await axios.get(`/api/seats/${showtimeId}`);
      setSeats(response.data);
    } catch (err) {
      console.error("Error loading seats:", err);
      // Initialize empty seat layout if no data exists
      initializeEmptySeats();
    }
  };

  const initializeEmptySeats = () => {
    const seatLayout = [];
    for (let row = 0; row < ROWS; row++) {
      const rowLabel = String.fromCharCode(65 + row);
      for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
        seatLayout.push({
          id: `${rowLabel}${seat + 1}`,
          row: rowLabel,
          number: seat + 1,
          status: "available", // available, selected, booked, reserved
          reserved_by: null,
          reserved_until: null,
          showtime_id: showtimeId,
        });
      }
    }
    setSeats(seatLayout);
  };

  const setupRealtimeSubscription = async () => {
    try {
      // Get session token for real-time subscription
      const sessionResponse = await axios.get("/api/auth/session-token");
      if (sessionResponse.data.access_token) {
        await supabase.auth.setSession({
          access_token: sessionResponse.data.access_token,
          refresh_token: sessionResponse.data.refresh_token,
        });
      }
    } catch (error) {
      console.error("Error setting up authenticated subscription:", error);
    }

    // Subscribe to real-time changes in seat status
    subscriptionRef.current = supabase
      .channel(`seats_${showtimeId}`)
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
      .subscribe();
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

  const handleSeatClick = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);

    // Disable click for booked and reserved seats
    if (!seat || seat.status === "booked" || seat.status === "reserved") {
      return;
    }

    // Toggle seat selection
    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    } else {
      // Select seat
      setSelectedSeats((prev) => [...prev, seatId]);
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.status === "booked") return "booked";
    if (seat.status === "reserved") return "reserved";
    if (selectedSeats.includes(seat.id)) return "selected";
    return "available";
  };

  const getSeatClass = (status) => {
    const baseClass = "w-10 h-10 m-1 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 relative";

    switch (status) {
      case "available":
        return `${baseClass} bg-blue-500 text-white hover:bg-blue-600 cursor-pointer`;
      case "selected":
        return `${baseClass} bg-blue-600 text-white border-2 border-blue-300 cursor-pointer`;
      case "reserved":
        return `${baseClass} bg-gray-500 text-white cursor-not-allowed opacity-70`;
      case "booked":
        return `${baseClass} bg-gray-700 text-white cursor-not-allowed`;
      default:
        return baseClass;
    }
  };

  const renderSeatIcon = (status) => {
    if (status === "selected") {
      return (
        <div className="absolute top-0 right-0 -mt-1 -mr-1">
          <div className="w-3 h-3 bg-blue-300 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      );
    }
    if (status === "booked" || status === "reserved") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs">✕</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading seats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
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
    <div className={className}>
      {/* Screen */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-3 rounded-t-3xl text-lg font-semibold">
          SCREEN
        </div>
      </div>

      {/* Seat Layout */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {Array.from({ length: ROWS }, (_, rowIndex) => {
              const rowLabel = String.fromCharCode(69 - rowIndex); // E, D, C, B, A
              return (
                <div key={rowIndex} className="flex items-center justify-center mb-2">
                  {/* Left Row Label */}
                  <div className="w-6 text-center font-bold text-gray-400 mr-4">
                    {rowLabel}
                  </div>

                  {/* Left Section Seats (1-5) */}
                  <div className="flex mr-8">
                    {seats
                      .filter(seat => seat.row === rowLabel)
                      .slice(0, 5)
                      .map((seat) => {
                        const status = getSeatStatus(seat);
                        const isClickable = status !== "booked" && status !== "reserved";
                        return (
                          <div
                            key={seat.id}
                            className={getSeatClass(status)}
                            onClick={() => isClickable && handleSeatClick(seat.id)}
                          >
                            {seat.number}
                            {renderSeatIcon(status)}
                          </div>
                        );
                      })}
                  </div>

                  {/* Right Section Seats (6-10) */}
                  <div className="flex">
                    {seats
                      .filter(seat => seat.row === rowLabel)
                      .slice(5, 10)
                      .map((seat) => {
                        const status = getSeatStatus(seat);
                        const isClickable = status !== "booked" && status !== "reserved";
                        return (
                          <div
                            key={seat.id}
                            className={getSeatClass(status)}
                            onClick={() => isClickable && handleSeatClick(seat.id)}
                          >
                            {seat.number}
                            {renderSeatIcon(status)}
                          </div>
                        );
                      })}
                  </div>

                  {/* Right Row Label */}
                  <div className="w-6 text-center font-bold text-gray-400 ml-4">
                    {rowLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-6">
          <div className="text-sm font-semibold">Hall 1</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-sm">Available Seat</span>
            <span className="text-xs text-gray-400">THB{PRICE_PER_SEAT}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs">✕</span>
            </div>
            <span className="text-sm">Booked Seat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
              <span className="text-xs">✕</span>
            </div>
            <span className="text-sm">Reserved Seat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;