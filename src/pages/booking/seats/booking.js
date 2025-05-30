import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { supabase } from "@/utils/supabase";
import { useStatus } from "@/context/StatusContext";

const SeatBookingPage = () => {
  const router = useRouter();
  const { movieId, showtimeId } = router.query;
  const { isLoggedIn, user, loading: authLoading } = useStatus();

  // State management
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  // const [movieInfo, setMovieInfo] = useState(null);
  // const [showtimeInfo, setShowtimeInfo] = useState(null);

  // Refs for cleanup
  const subscriptionRef = useRef(null);
  const reservationTimerRef = useRef(null);

  // Configuration
  const RESERVATION_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
  const ROWS = 5;
  const SEATS_PER_ROW = 10;

  // Initialize component
  useEffect(() => {
    if (movieId && showtimeId) {
      initializePage();
    }

    return () => {
      // Cleanup subscriptions and timers
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (reservationTimerRef.current) {
        clearTimeout(reservationTimerRef.current);
      }
    };
  }, [movieId, showtimeId]);

  const initializePage = async () => {
    try {
      setLoading(true);

      // Load initial data
      await Promise.all([
        loadSeats(), 
        // loadMovieInfo(),
        // loadShowtimeInfo(),
        setupRealtimeSubscription()
      ]);
    } catch (err) {
      setError("Failed to initialize booking page");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const loadMovieInfo = async () => {
  //   try {
  //     const response = await axios.get(`/api/movies/${movieId}`);
  //     setMovieInfo(response.data);
  //   } catch (err) {
  //     console.error("Error loading movie info:", err);
  //   }
  // };

  // const loadShowtimeInfo = async () => {
  //   try {
  //     const response = await axios.get(`/api/showtimes/${showtimeId}`);
  //     setShowtimeInfo(response.data);
  //   } catch (err) {
  //     console.error("Error loading showtime info:", err);
  //   }
  // };

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

  const handleNext = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    // Check if user is logged in, if not, redirect to login
    if (!isLoggedIn || !user) {
      alert("Please log in to continue with booking");
      // You can redirect to login page here
      router.push(`/login?redirect=/booking/${movieId}/${showtimeId}`);
      return;
    }

    setIsBooking(true);

    try {
      // Reserve selected seats before proceeding to payment
      const reservationPromises = selectedSeats.map(seatId => 
        axios.post("/api/seats/reserve", {
          seatId,
          showtimeId,
          userId: user,
          reservationTime: RESERVATION_TIME,
        })
      );

      await Promise.all(reservationPromises);

      // Proceed to payment page
      router.push({
        pathname: `/booking/payment/${movieId}/${showtimeId}`,
        query: {
          seats: selectedSeats.join(','),
          total: calculateTotalPrice()
        }
      });
      
    } catch (err) {
      console.error("Error reserving seats:", err);
      alert("Failed to reserve seats. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const calculateTotalPrice = () => {
    const pricePerSeat = 150; // THB150 as shown in the image
    return selectedSeats.length * pricePerSeat;
  };

  const getSeatStatus = (seat) => {
    if (seat.status === "booked") return "booked";
    if (seat.status === "reserved") return "reserved";
    if (selectedSeats.includes(seat.id)) return "selected";
    return "available";
  };

  const getSeatClass = (status, isClickable = true) => {
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading seats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with Progress */}
      <div className="bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-8 mb-6">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="ml-2 text-sm">Select showtime</span>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">2</span>
              </div>
              <span className="ml-2 text-sm font-semibold">Select seat</span>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">3</span>
              </div>
              <span className="ml-2 text-sm text-gray-400">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Side - Seat Selection */}
          <div className="flex-1">
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

                        {/* Left Section Seats */}
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
                                  className={getSeatClass(status, isClickable)}
                                  onClick={() => isClickable && handleSeatClick(seat.id)}
                                >
                                  {seat.number}
                                  {renderSeatIcon(status)}
                                </div>
                              );
                            })}
                        </div>

                        {/* Right Section Seats */}
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
                                  className={getSeatClass(status, isClickable)}
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
                  <span className="text-xs text-gray-400">THB150</span>
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

          {/* Right Side - Movie Info & Summary */}
          <div className="w-80">
            {/* Movie Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-gray-700 rounded overflow-hidden">
                  {movieInfo?.poster_url && (
                    <img 
                      src={movieInfo.poster_url} 
                      alt={movieInfo?.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {movieInfo?.title || "The Dark Knight"}
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {movieInfo?.genre || "Action"}
                    </span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {movieInfo?.genre2 || "Crime"}
                    </span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {movieInfo?.rating || "TH"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">📍</span>
                  {showtimeInfo?.cinema_name || "Minor Cineplex Arkham"}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">📅</span>
                  {showtimeInfo?.date || "24 Jun 2024"}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">🕐</span>
                  {showtimeInfo?.time || "16:30"}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">🎬</span>
                  {showtimeInfo?.hall || "Hall 1"}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Selected Seat</span>
                  <span>{selectedSeats.join(", ") || "-"}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>THB{calculateTotalPrice()}</span>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                disabled={isBooking || selectedSeats.length === 0}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isBooking || selectedSeats.length === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isBooking ? "Processing..." : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;