import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useStatus } from '@/context/StatusContext';

const BookingHistory = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useStatus();
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  console.log('Booking History:', bookingHistory);

  // Function to format date as "4 JUN 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!isLoggedIn || !user) return;

      try {
        const response = await axios.get('/api/booking/booking-history');
        setBookingHistory(response.data.data);
      } catch (error) {
        console.error('Error fetching booking history:', error);
      }
    };

    fetchBookingHistory();
  }, [user, isLoggedIn]);

  return (
    <div className="md:w-2/3 min-h-screen p-5 text-white">
      <h1 className="text-white text-3xl mb-8">Booking History</h1>
      {bookingHistory.length > 0 ? (
        <div>
          {bookingHistory.map((booking) => (
            <div 
              key={booking.booking_id} 
              className="bg-[#070C1B] rounded-xl p-5 mb-8 cursor-pointer hover:bg-[#0a1025] transition-colors"
              onClick={() => handleBookingClick(booking)}
            >
              {/* Movie Information Section */}
              <div className="flex items-center gap-5 mb-5">
                {/* Movie Poster */}
                <div className="w-30 h-40 rounded-lg overflow-hidden flex-shrink-0">
                  {booking.movie.poster_url ? (
                    <img 
                      src={booking.movie.poster_url} 
                      alt={booking.movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      Movie Poster
                    </div>
                  )}
                </div>

                {/* Movie Details */}
                <div className="flex-1">
                  <h2 className="text-white text-2xl mb-4 font-semibold">
                    {booking.movie.title}
                  </h2>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📍</span>
                      <span className="text-gray-300">{booking.cinema.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📅</span>
                      <span className="text-gray-300">
                        {formatDate(booking.showtime.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🕐</span>
                      <span className="text-gray-300">{booking.showtime.start_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🎭</span>
                      <span className="text-gray-300">Hall {booking.cinema.hall || '1'}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="text-right">
                  <div className="mb-3">
                    <div className="text-gray-400 text-sm">Booking No.</div>
                    <div className="text-white font-bold">
                      {(booking.booking_id || 'AKT1223').toString().substring(0, 8).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <div className="text-gray-400 text-sm">Booked date</div>
                    <div className="text-white">
                      {formatDate(booking.booking_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="flex justify-between items-center border-t border-gray-700 pt-5">
                {/* Ticket Count */}
                <div className="bg-[#21263F] py-4 px-5 rounded-lg text-center min-w-[100px]">
                  <div className="text-white font-bold text-lg">
                    {booking.seats.length} Tickets
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex-1 ml-8">
                  <div className="mb-3">
                    <span className="text-gray-400 inline-block w-35">
                      Selected Seat
                    </span>
                    <span className="text-white"> {booking.seats.join(', ')}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 inline-block w-35">
                      Payment method
                    </span>
                    <span className="text-white"> Credit card</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  {booking.status === 'booked' ? (
                    <div className="bg-green-500 text-white py-2 px-5 rounded-full font-bold">
                      Paid
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white py-2 px-5 rounded-full font-bold">
                      {booking.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-12">
          No booking history found.
        </p>
      )}

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#070C1B] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#070C1B] rounded-xl p-6 max-w-md w-full mx-4 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold">Booking Detail</h3>
              <div className="flex items-center gap-3">
                {/* Share Button */}
                <button className="text-gray-400 hover:text-white">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" 
                      fill="currentColor"
                    />
                  </svg>
                </button>
                {/* Close Button */}
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Movie Info in Modal */}
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-28 bg-slate-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                <img
                  src={selectedBooking.movie.poster_url || '/placeholder-poster.png'}
                  alt={selectedBooking.movie.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-lg font-semibold mb-2">
                  {selectedBooking.movie.title}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-300">{selectedBooking.cinema.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-300">{formatDate(selectedBooking.showtime.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🕐</span>
                    <span className="text-gray-300">{selectedBooking.showtime.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🎭</span>
                    <span className="text-gray-300">Hall {selectedBooking.cinema.hall || '1'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <div className="text-gray-400 text-xs">Booking No.</div>
                  <div className="text-white font-bold text-sm">
                    {(selectedBooking.booking_id || 'AKT1223').toString().substring(0, 8).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Booked date</div>
                  <div className="text-white text-sm">{formatDate(selectedBooking.booking_date)}</div>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#21263F] py-3 px-4 rounded-lg">
                <div className="text-white font-bold">
                  {selectedBooking.seats.length} Tickets
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-gray-400 text-sm">Selected Seat </span>
                  <span className="text-white">{selectedBooking.seats.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Payment method </span>
                  <span className="text-white">Credit card</span>
                </div>
              </div>
              <div>
                {selectedBooking.status === 'booked' ? (
                  <div className="bg-green-500 text-white py-1 px-3 rounded-full font-bold text-sm">
                    Paid
                  </div>
                ) : (
                  <div className="bg-red-500 text-white py-1 px-3 rounded-full font-bold text-sm">
                    {selectedBooking.status}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-[#21263F] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Payment method</div>
                  <div className="text-white">Credit card</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">{}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <div className="text-gray-400">Ticket x{selectedBooking.seats.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">THB{selectedBooking.total_price}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <div className="text-gray-400">Coupon</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400">-THB50</div>
                </div>
              </div>
              <hr className="border-gray-600 my-3" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white font-bold">Total</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">THB{(selectedBooking.total_price) - 50}</div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Cancel booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;