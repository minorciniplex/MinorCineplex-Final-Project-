import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useStatus } from "@/context/StatusContext";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CancellationHistory = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useStatus();
  const [cancellationHistory, setCancellationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to format date as "4 JUN 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getStatusColor = (refundStatus) => {
    switch (refundStatus) {
      case 'completed':
        return 'bg-[--brand-green]';
      case 'pending':
        return 'bg-[--brand-yellow]';
      case 'processing':
        return 'bg-[--brand-blue]';
      case 'failed':
        return 'bg-[--brand-red]';
      default:
        return 'bg-[--base-gray-300]';
    }
  };

  const getRefundStatusText = (refundStatus) => {
    switch (refundStatus) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchCancellationHistory = async () => {
      try {
        setLoading(true);
        console.log("Fetching cancellation history...");
        
        const response = await axios.get("/api/booking/cancellation-history-simple");
        console.log("API Response:", response.data);
        
        setCancellationHistory(response.data.data || []);
        console.log("Cancellation history set:", response.data.data?.length || 0, "items");
      } catch (error) {
        console.error("Error fetching cancellation history:", error);
        console.error("Error details:", error.response?.data);
        setCancellationHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchCancellationHistory();
    } else {
      console.log("User not logged in, skipping fetch");
    }
  }, [isLoggedIn]);

  const handleBack = () => {
    router.push("/dashboard/booking-history");
  };

  if (loading) {
    return (
      <div className="max-w md:w-2/3 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading cancellation history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w md:w-2/3 text-white">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6 pl-4 md:pl-0">
        <button
          onClick={handleBack}
          className="text-[--base-gray-300] hover:text-white transition-colors p-2 rounded-full hover:bg-[--base-gray-100]"
        >
          <ArrowBackIcon />
        </button>
        <h1 className="text-white text-4xl font-bold">
          Cancellation History
        </h1>
      </div>

      {cancellationHistory.length > 0 ? (
        <div className="space-y-4">
          {cancellationHistory.map((cancellation) => (
            <div
              key={cancellation.cancellationId}
              className="bg-[#070C1B] rounded-lg p-4 md:p-6"
            >
              {/* Movie Information */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Movie Poster */}
                <div className="flex gap-6">
                  <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    {cancellation.movie.poster_url ? (
                      <img
                        src={cancellation.movie.poster_url}
                        alt={cancellation.movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        Poster
                      </div>
                    )}
                  </div>

                  {/* Movie Details */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-white text-xl mb-3 font-semibold">
                      {cancellation.movie.title}
                    </h2>

                    <div className="flex flex-col text-sm gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <FmdGoodIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {cancellation.cinema.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <CalendarMonthIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {formatDate(cancellation.showtime.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[--base-gray-200]">
                          <AccessTimeIcon style={{ fontSize: 16 }} />
                        </span>
                        <span className="text-[--base-gray-400]">
                          {cancellation.showtime.start_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Info */}
                <div className="md:ml-auto text-sm">
                  <div className="flex gap-2 mb-1">
                    <div className="text-[--base-gray-300]">Cancelled date</div>
                    <div className="font-medium text-[--base-gray-400]">
                      {formatDate(cancellation.cancellationDate)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-[--base-gray-300]">Time</div>
                    <div className="font-medium text-[--base-gray-400]">
                      {formatTime(cancellation.cancellationDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Details */}
              <div className="border-t border-[--base-gray-100] pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Reason */}
                  <div className="bg-[#21263F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CancelIcon className="text-[--brand-red]" style={{ fontSize: 18 }} />
                      <span className="text-[--base-gray-300] text-sm font-medium">
                        Reason
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      {cancellation.cancellationReason}
                    </div>
                  </div>

                  {/* Original Amount */}
                  <div className="bg-[#21263F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MonetizationOnIcon className="text-[--base-gray-200]" style={{ fontSize: 18 }} />
                      <span className="text-[--base-gray-300] text-sm font-medium">
                        Original Amount
                      </span>
                    </div>
                    <div className="text-white font-bold">
                      THB{cancellation.originalAmount}
                    </div>
                  </div>

                  {/* Refund Amount */}
                  <div className="bg-[#21263F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MonetizationOnIcon className="text-[--brand-green]" style={{ fontSize: 18 }} />
                      <span className="text-[--base-gray-300] text-sm font-medium">
                        Refund Amount
                      </span>
                    </div>
                    <div className="text-[--brand-green] font-bold">
                      THB{cancellation.refundAmount}
                    </div>
                    <div className="text-[--base-gray-400] text-xs">
                      ({cancellation.refundPercentage}% refund)
                    </div>
                  </div>

                  {/* Refund Status */}
                  <div className="bg-[#21263F] rounded-lg p-4">
                    <div className="text-[--base-gray-300] text-sm font-medium mb-2">
                      Refund Status
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(cancellation.refundStatus)}`}>
                      {getRefundStatusText(cancellation.refundStatus)}
                    </div>
                    {cancellation.hoursBeforeShowtime !== undefined && (
                      <div className="text-[--base-gray-400] text-xs mt-1">
                        {cancellation.hoursBeforeShowtime.toFixed(1)}h before showtime
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-12">
          <div className="bg-[#070C1B] rounded-lg p-8">
            <CancelIcon className="text-[--base-gray-300] mx-auto mb-4" style={{ fontSize: 48 }} />
                         <p className="text-gray-400 text-lg mb-2">No cancellation history found</p>
             <p className="text-[--base-gray-400] text-sm">
               You haven&apos;t cancelled any bookings yet.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationHistory; 