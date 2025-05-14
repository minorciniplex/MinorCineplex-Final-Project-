import { useFetchCoupon } from "@/context/fecthCouponContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CategoryBar() {
  const { coupons, setCoupons } = useFetchCoupon();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

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
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === category
              ? "bg-brand-blue-100 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
