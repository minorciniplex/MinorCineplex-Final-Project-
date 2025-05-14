import { useFetchCoupon } from "@/context/fecthCouponContext";
import { useState, useEffect } from "react";
import axios from "axios";


export default function CategoryBar() {
  const { coupons, setCoupons } = useFetchCoupon();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const uniqueOwners = [...new Set(coupons.map(coupon => coupon.owner_name))];
    setCategories(["All coupons", ...uniqueOwners]);
  }, []); 

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    
    if (category === "All coupons") {
      try {
        const response = await axios.get("/api/coupons/get-coupon");
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching All coupons:", error);
      }
    } else {
      try {
        const response = await axios.get(`/api/coupons/get-coupon/name?owner_name=${category}`);
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching category coupons:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    
    <div className="
      w-full
      h-[118px]
      sm:grid sm:grid-rows-3 sm:grid-flow-col sm:gap-x-4 sm:gap-y-2
      md:grid md:grid-rows-2 md:grid-flow-col md:gap-x-4 md:gap-y-2
      lg:grid lg:grid-rows-1 lg:grid-flow-col lg:gap-x-4 lg:gap-y-2
      flex flex-wrap items-center justify-center
      px-2 sm:px-4 md:px-[120px]
      mx-auto scrollbar-hide
      md:flex md:flex-nowrap 
      bg-[#070C1B] font-bold text-[24px] leading-[30px] tracking-normal 
    ">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-3 md:px-6 py-1.5 md:py-2  text-xs md:text-base font-semibold transition-colors duration-200  text-white  hover:text-white hover:underline`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
