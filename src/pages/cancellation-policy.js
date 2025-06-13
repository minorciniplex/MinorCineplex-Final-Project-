import { useRouter } from "next/router";
import { ArrowBack } from "@mui/icons-material";

const CancellationPolicy = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#070C1B] text-white">
      {/* Header */}
      <div className="bg-[#21263F] border-b border-[--base-gray-200]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-[--base-gray-300] hover:text-white transition-colors"
            >
              <ArrowBack />
            </button>
            <h1 className="text-2xl font-bold">Cancellation Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#21263F] rounded-lg p-6 md:p-8">
          {/* Last Updated */}
          <div className="text-[--base-gray-400] text-sm mb-8">
            Last updated: June 24, 2024
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Overview
            </h2>
            <p className="text-[--base-gray-300] leading-relaxed mb-4">
              This Cancellation Policy outlines the terms and conditions for cancelling movie ticket bookings at Minor Cineplex. We aim to provide flexibility while maintaining fair booking practices for all customers.
            </p>
          </section>

          {/* Cancellation Timeline */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Cancellation Timeline & Refunds
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[#070C1B] rounded-lg p-4 border-l-4 border-[--brand-green]">
                <h3 className="font-semibold text-[--brand-green] mb-2">
                  Full Refund (100%)
                </h3>
                <p className="text-[--base-gray-300] text-sm">
                  Cancellation made <strong>2 hours or more</strong> before showtime
                </p>
              </div>

              <div className="bg-[#070C1B] rounded-lg p-4 border-l-4 border-[--brand-yellow]">
                <h3 className="font-semibold text-[--brand-yellow] mb-2">
                  Partial Refund (75%)
                </h3>
                <p className="text-[--base-gray-300] text-sm">
                  Cancellation made <strong>30 minutes to 2 hours</strong> before showtime
                </p>
              </div>

              <div className="bg-[#070C1B] rounded-lg p-4 border-l-4 border-[--brand-red]">
                <h3 className="font-semibold text-[--brand-red] mb-2">
                  No Refund (0%)
                </h3>
                <p className="text-[--base-gray-300] text-sm">
                  Cancellation made <strong>less than 30 minutes</strong> before showtime or after showtime has started
                </p>
              </div>
            </div>
          </section>

          {/* How to Cancel */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              How to Cancel Your Booking
            </h2>
            <div className="space-y-3 text-[--base-gray-300]">
              <div className="flex items-start gap-3">
                <span className="bg-[--brand-blue] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <p>Log in to your account and go to &quot;Booking History&quot;</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[--brand-blue] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <p>Find your booking and click &quot;Cancel booking&quot;</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[--brand-blue] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <p>Select your reason for cancellation</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[--brand-blue] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <p>Confirm your cancellation to process the refund</p>
              </div>
            </div>
          </section>

          {/* Refund Processing */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Refund Processing
            </h2>
            <div className="bg-[#070C1B] rounded-lg p-4">
              <ul className="space-y-2 text-[--base-gray-300] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-green] mt-1">•</span>
                  <span>Refunds are processed to the original payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-green] mt-1">•</span>
                  <span>Credit card refunds: 3-7 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-green] mt-1">•</span>
                  <span>Digital wallet refunds: 1-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-green] mt-1">•</span>
                  <span>Bank transfer refunds: 1-5 business days</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Special Circumstances
            </h2>
            <div className="space-y-4">
              <div className="bg-[#070C1B] rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-[--brand-yellow]">
                  Force Majeure Events
                </h3>
                <p className="text-[--base-gray-300] text-sm">
                  In case of natural disasters, government restrictions, technical failures, or other unforeseen circumstances that prevent the screening, full refunds will be provided regardless of timing.
                </p>
              </div>

              <div className="bg-[#070C1B] rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-[--brand-yellow]">
                  Medical Emergencies
                </h3>
                <p className="text-[--base-gray-300] text-sm">
                  With valid medical documentation, exceptions may be made to the standard cancellation policy. Please contact customer service for assistance.
                </p>
              </div>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Terms & Conditions
            </h2>
            <div className="bg-[#070C1B] rounded-lg p-4">
              <ul className="space-y-2 text-[--base-gray-300] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-red] mt-1">•</span>
                  <span>Only the original booker can cancel the reservation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-red] mt-1">•</span>
                  <span>Promotional tickets and group bookings may have different cancellation terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-red] mt-1">•</span>
                  <span>Convenience fees and booking charges are non-refundable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-red] mt-1">•</span>
                  <span>Partial cancellations for group bookings are not allowed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[--brand-red] mt-1">•</span>
                  <span>This policy is subject to change without prior notice</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-[--brand-blue]">
              Need Help?
            </h2>
            <div className="bg-[#070C1B] rounded-lg p-4">
              <p className="text-[--base-gray-300] mb-4">
                If you have questions about this cancellation policy or need assistance with your booking, please contact us:
              </p>
              <div className="space-y-2 text-[--base-gray-300]">
                <div className="flex items-center gap-3">
                  <span className="text-[--brand-blue]">📞</span>
                  <span>Customer Service: 02-123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[--brand-blue]">✉️</span>
                  <span>Email: support@minorcineplex.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[--brand-blue]">🕐</span>
                  <span>Operating Hours: 9:00 AM - 10:00 PM (Daily)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy; 