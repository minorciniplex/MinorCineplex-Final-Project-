import axios from "axios";
import { useState, useEffect } from "react";
import { useFetchCoupon } from "@/context/fecthCouponContext";

export default function CategoryBar() {
  const [couponOwner, setCouponOwner] = useState("All");
  const { coupons, setCoupons } = useFetchCoupon();
  



  const getCouponOwner = async (ownerName) => {
    try {
      const res = await axios.get(
        `/api/coupons/get-coupons/name?ownerName=${ownerName}`
      );
      setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  }, []);

  return (
    <>
      <div>
        <button
          
          onClick={() => {
            setCouponOwner("All");
            // setCoupons([]);
          }}
          className={`px-4 py-3 transition-colors rounded-sm text-sm text-muted-foreground font-medium ${
            couponOwner === "All" ? "bg-[#DAD6D1]" : "hover:bg-muted"
          }`}
        >
          ทั้งหมด
        </button>

        {coupons?.map((coupon) => (
          <button
            key={coupon.id}
            
            onClick={() => {
            //   setCouponOwner(coupon.owner_name);
            //   setCoupons(couponOwner);
            getCouponOwner(coupon.owner_name);
            }}
            className={`px-4 py-3 transition-colors rounded-sm text-sm text-muted-foreground font-medium ${
              coupon.coupon_owner === couponOwner ? "bg-[#DAD6D1]" : "hover:bg-muted"
            }`}
          >
            {coupon.owner_name}
          </button>
        ))}
      </div>

     
    </>
  );
}
