import CouponsCard from "@/components/Coupons-components/CouponsCard";
import { useStatus } from "@/context/StatusContext";
import { useFetchCoupon } from "@/context/fecthCouponContext";
import CategoryBar from "@/components/Coupons-components/CategoryBar";
import { useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar/Navbar";
import FooterSection from '@/components/sections/FooterSection/FooterSection';
import Pagination from "@/components/Pagination";

export default function Coupons() {
    const { coupons, loading } = useFetchCoupon();
    const { isLoggedIn, user } = useStatus();
    const [couponOwnersId, setCouponOwnersId] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 
    const totalPages = Math.ceil(coupons?.length / itemsPerPage) || 1;
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // คำนวณ coupons ที่จะแสดงในหน้าปัจจุบัน
    const getCurrentPageCoupons = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return coupons?.slice(startIndex, endIndex) || [];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
            {/* //     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue-100"></div> */}
             </div>
        );
    }

    return (
        <>
        <Navbar />
        <div className="w-full min-h-screen flex flex-col items-center ]">
            <div className="w-full md:pt-[80px] sm:pt-[48px]">
                <CategoryBar />
            </div>

            <div className="w-full max-w-[1440px] mx-auto  flex flex-col px-4 md:px-[40px] lg:px-[120px] pt-[40px] pb-[80px] gap-[40px] ">
                <div className="flex flex-col gap-[40px]">
                    <div className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        md:grid-cols-2
                        lg:grid-cols-4
                        lg:gap-x-5 lg:gap-y-10
                        sm:gap-x-3 sm:gap-y-6
                    ">
                        {getCurrentPageCoupons().map((coupon) => (
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
                    <div className="flex justify-center mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full mt-auto">
                <FooterSection/>
            </div>
        </div>
        </>
    );
}
