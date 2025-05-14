import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FetchCouponContext = createContext();

export function FetchCouponProvider({ children }) {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log(coupons)
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get("/api/coupons/get-coupons");
                setCoupons(response.data.coupons);
            } catch (error) {
                console.error("Error fetching coupons:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCoupons();
    }, []);

    return (
        <FetchCouponContext.Provider value={{ coupons, loading }}>
            {children}
        </FetchCouponContext.Provider>
    );
}

export const useFetchCoupon = () => useContext(FetchCouponContext);