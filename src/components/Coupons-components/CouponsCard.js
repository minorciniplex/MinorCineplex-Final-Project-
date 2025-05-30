import { useRouter } from "next/navigation";
import { useStatus } from "@/context/StatusContext";
import { useCouponClaim } from "@/hooks/useCouponClaim";
import { Loading } from "../ui/loading";
import CouponButton from "./CouponButton";
import CouponAlert from "./CouponAlert";
import { useState } from "react";
import Image from "next/image";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

function CouponsCard({ coupon_id, image, title, end_date }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useStatus();
  const { isClaimed, isLoading, handleClaimCoupon, alertOpen, setAlertOpen } =
    useCouponClaim(coupon_id);


  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="w-full max-w-[161px] bg-[#10142A] flex flex-col rounded-[4px] shadow-[0_4px_16px_0_rgba(0,0,0,0.10)] overflow-hidden group cursor-pointer border border-[#23284A] transition-transform duration-200 hover:scale-[1.03] md:w-[285px] md:max-w-[285px] md:rounded-[8px] h-full">
        <div
          className="w-full h-[161px] md:w-[285px] md:h-[285px] bg-cover bg-center flex items-center justify-center border-b border-[#23284A] md:bg-cover md:bg-center"
          onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              width={285}
              height={285}
              className="object-cover w-full h-[161px] md:w-[285px] md:h-[285px]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-base-gray-100">
              No Image
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 mt-3 pb-3 md:pt-4 md:pb-6 md:px-6 w-full bg-[#10142A]">
          <div className="flex flex-col gap-2 px-2 w-full">
            <h3
              className="text-basewhite body-1-medium text-left text-xs md:headline-4 group-hover:text-brandblue-100 transition-colors duration-200 max-w-full line-clamp-2 tracking-tight"
              onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)}
            >
              {truncateText(title, 38)}
            </h3>
            <div className="flex items-center gap-2 w-full text-[11px] md:text-base mt-1">
              <span className="text-base-gray-300 md:body-2-regular whitespace-nowrap">
                Valid until
              </span>
              <span className="text-base-gray-400 md:body-2-medium flex-1 truncate">
                {formatDate(end_date)}
              </span>
            </div>
          </div>
          <div className="w-full mt-auto flex justify-center">
            <CouponButton
              isClaimed={isClaimed}
              isLoggedIn={isLoggedIn}
              couponId={coupon_id}
              handleClaimCoupon={handleClaimCoupon}
              setAlertOpen={setAlertOpen}
            />
          </div>
        </div>
      </div>
      <CouponAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        text="Coupon claimed successfully"
        text_sub="You can now use this coupon"
      />
    </>
  );
}

export default CouponsCard;
