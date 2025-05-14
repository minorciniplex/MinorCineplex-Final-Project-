
import CouponsCard from "@/components/Coupons-components/Coupons-card";
import { useStatus } from "@/context/StatusContext";
import { useFetchCoupon } from "@/context/fecthCouponContext";
import CategoryBar from "@/components/Coupons-components/category-bar";
import { useState } from "react";
import axios from "axios";
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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">คูปองทั้งหมด</h1>
            <CategoryBar />
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    );
}
