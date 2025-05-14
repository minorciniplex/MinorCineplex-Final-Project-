import CouponsCard from "@/components/coupons-components/CouponsCard";
import { useStatus } from "@/context/StatusContext";
import { useFetchCoupon } from "@/context/fecthCouponContext";
import CategoryBar from "@/components/coupons-components/CategoryBar";
import { useState } from "react";
import axios from "axios";
import NavbarByCinema from "../home-landing/sections/NavbarByCinema/NavbarByCinema";
import FooterSection from "../home-landing/sections/FooterSection/FooterSection";

export default function Coupons() {
    const { coupons, loading } = useFetchCoupon();
    const { isLoggedIn, user } = useStatus();
    const [couponOwnersId, setCouponOwnersId] = useState([]);
 
    

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue-100"></div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center ]">
            <div className="w-full">
                <NavbarByCinema />
            </div>

            <div className="w-[1440px] px-[120px] pt-[40px] pb-[24px] mt-[40px]">
                <CategoryBar />
            </div>

            <div className="w-full max-w-[1440px] mx-auto flex-grow flex flex-col px-4 md:px-[40px] lg:px-[120px] pt-0 pb-[80px] gap-[40px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-x-[24px] gap-y-[40px] w-full">
                    {coupons?.map((coupon) => (
                        <CouponsCard 
                            key={coupon.coupon_id}
                            coupon_id={coupon.coupon_id}
                            image={coupon.image}
                            title={coupon.title}
                            end_date={coupon.end_date}
                            onClaimCoupon={() => handleClaimCoupon(coupon.coupon_id)}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full">
                <FooterSection />
            </div>
        </div>
    );
}
