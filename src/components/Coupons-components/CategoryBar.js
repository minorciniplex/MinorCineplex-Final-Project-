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
    setCategories(["ทั้งหมด", ...uniqueOwners]);
  }, []); 

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    
    if (category === "ทั้งหมด") {
      try {
        const response = await axios.get("/api/coupons/get-coupon");
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching all coupons:", error);
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
      lg:mt-4
      sm:grid sm:grid-rows-3 sm:grid-flow-col sm:gap-x-4 sm:gap-y-2
      md:grid md:grid-rows-2 md:grid-flow-col md:gap-x-4 md:gap-y-2
      lg:grid lg:grid-rows-1 lg:grid-flow-col lg:gap-x-4 lg:gap-y-2
      flex flex-wrap items-center justify-center gap-1
      px-2 sm:px-4 md:px-[120px]
      rounded-[8px] mx-auto scrollbar-hide
      md:flex md:flex-nowrap 

    ">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-base font-semibold transition-colors duration-200 bg-[#101624] text-[#A0AEC0] hover:bg-[#181F2A] hover:text-white`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
