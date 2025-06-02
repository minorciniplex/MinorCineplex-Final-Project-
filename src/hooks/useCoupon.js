import axios from "axios";
import { useState } from "react";

export const useCoupon = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    console.log(discountAmount);
    
    const checkCoupon = async (bookingId, couponId, totalPrice) => {
        setLoading(true);
        setError(null);
        console.log('Sending request to /api/use-coupon with:', {
            booking_id: bookingId,
            coupon_id: couponId
        });
        
        try {
            const response = await axios.post("/api/use-coupon", {
                booking_id: bookingId,
                coupon_id: couponId
            });
            console.log('Response from /api/use-coupon:', response.data);
            if (response.data.success) {
                setDiscountAmount(response.data.discount_amount);
                const final_price = response.data.final_price !== undefined
                    ? response.data.final_price
                    : (typeof totalPrice === 'number' ? totalPrice - response.data.discount_amount : undefined);
                return {
                    ...response.data,
                    final_price
                };
            } else {
                throw new Error(response.data.error || 'เกิดข้อผิดพลาดในการตรวจสอบคูปอง');
            }
        } catch (error) {
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            const errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการตรวจสอบคูปอง";
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async (bookingId, couponId, discountAmount) => {
        setLoading(true);
        setError(null);
        console.log('Sending request to /api/use-coupon/apply with:', {
            booking_id: bookingId,
            coupon_id: couponId,
            discount_amount: discountAmount
        });
        
        try {
            const response = await axios.post("/api/use-coupon/apply", {
                booking_id: bookingId,
                coupon_id: couponId,
                discount_amount: discountAmount
            });
            console.log('Response from /api/use-coupon/apply:', response.data);
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.error || 'เกิดข้อผิดพลาดในการใช้งานคูปอง');
            }
        } catch (error) {
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            const errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการใช้งานคูปอง";
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        discountAmount,
        checkCoupon,
        applyCoupon
    };
}; 