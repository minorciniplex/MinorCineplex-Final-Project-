import { useFetchCoupon } from "@/context/fecthCouponContext";
import { useState, useEffect } from "react";
import axios from "axios";


export default function CategoryBar() {
  const { coupons, setCoupons } = useFetchCoupon();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // สร้างรายการ categories จาก owner_name ที่ไม่ซ้ำกัน
    const uniqueOwners = [...new Set(coupons.map(coupon => coupon.owner_name))];
    setCategories(["ทั้งหมด", ...uniqueOwners]);
  }, []); // เรียกครั้งเดียวตอนโหลดคอมโพเนนต์

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    
    if (category === "ทั้งหมด") {
      // ถ้าเลือก "ทั้งหมด" ให้โหลดคูปองทั้งหมดใหม่
      try {
        const response = await axios.get("/api/coupons/get-coupons");
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching all coupons:", error);
      }
    } else {
      // ถ้าเลือก category เฉพาะ ให้โหลดคูปองของ owner นั้นๆ
      try {
        const response = await axios.get(`/api/coupons/get-coupons/name?owner_name=${category}`);
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching category coupons:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    
    <div className="w-full hidden md:flex items-center gap-1 md:gap-4 px-2 sm:px-4 md:px-[120px] rounded-[8px]  mx-auto overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-base font-semibold transition-colors duration-200 "bg-[#101624] text-[#A0AEC0] hover:bg-[#181F2A] hover:text-white"}
          `}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
