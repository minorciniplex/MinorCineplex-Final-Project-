import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CouponButton from "@/components/Coupons-components/CouponButton";
import { useStatus } from "@/context/StatusContext";
import { useCouponClaim } from "@/hooks/useCouponClaim";
import Navbar from "@/components/Navbar/Navbar";
import FooterSection from "@/pages/home-landing/sections/FooterSection/FooterSection";
import CouponAlert from "@/components/Coupons-components/CouponAlert";
export default function Viewcoupon() {
  const router = useRouter();
  const { couponId } = router.query;
  const [data, setData] = useState(null);
  const { isLoggedIn } = useStatus();
  const { isClaimed, handleClaimCoupon, alertOpen, setAlertOpen } = useCouponClaim(couponId);
  const [isDetailPage, setIsDetailPage] = useState(false);
  const fetchCoupon = async () => {
    try {
      const response = await axios.get(
        `/api/coupons/get-coupon-by-id?coupon_id=${couponId}`
      );
      setData(response.data.coupon);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
    }
  }, [couponId]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#101525]">
      <Navbar />
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-120px)] py-10 px-2 md:px-0">
        {data ? (
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl rounded-xl  p-6 md:p-10 ">
            {/* Image Section */}
            <div className="flex-shrink-0 flex items-center justify-center w-full md:w-[380px] h-[380px] md:h-[380px] bg-[#070C1B] rounded-lg overflow-hidden border border-[#232B3E]">
              <img
                src={data.image}
                alt={data.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Details Section */}
            <div className="flex-1 flex flex-col gap-4 text-white bg-[#101624]">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{data.title}</h1>
              <div className="flex items-center gap-2 text-base-gray-300 text-sm md:text-base">
                <span className="font-medium">Valid until</span>
                <span className="bg-[#232B3E] px-3 py-1 rounded text-brand-blue-100 font-semibold">{data.end_date}</span>
              </div>
              <div className="my-2">
                <CouponButton
                  isClaimed={isClaimed}
                  isLoggedIn={isLoggedIn}
                  couponId={couponId}
                  handleClaimCoupon={handleClaimCoupon}
                  isDetailPage={true}
                  className="w-[153px] h-[48px] gap-[6px] rounded-[4px] pt-3 pr-[40px] pb-3 pl-[40px] text-base font-semibold"
                />
              </div>
              <div className="text-base-gray-300 text-sm md:text-base whitespace-pre-line mb-2">{data.description}</div>
              <div className=" rounded-lg p-4 ">
                <div className="font-semibold text-base mb-2 ">Terms & Conditions</div>
                <ol className="list-decimal list-inside text-xs md:text-sm text-base-gray-300 space-y-1 pl-2">
                  <li>Valid for a minimum purchase {data.min_purchase} THB.</li>
                  <li>Applicable for Deluxe seats at all branches and Premium seats.</li>
                  <li>Valid from {data.start_date} – {data.end_date}, only.</li>
                  <li>Resale for commercial purposes is not allowed.</li>
                  <li>Non-transferable to others.</li>
                  <li>Cannot be combined with other discounts or promotional offers.</li>
                  <li>Not valid for 3D movies.</li>
                  <li>Cannot be exchanged or redeemed for cash.</li>
                  <li>Non-refundable and cannot be canceled under any circumstances.</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white text-lg mt-10">กำลังโหลด...</p>
        )}
        <CouponAlert
          open={alertOpen}
          onClose={() => setAlertOpen(false)}
        />
      </div>
      <FooterSection />
    </div>
  );
}
