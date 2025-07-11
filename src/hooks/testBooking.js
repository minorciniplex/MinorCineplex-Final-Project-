import axios from "axios";
import { useState, useEffect } from "react";

export const useTestBooking = (showtimes, bookingId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            
            try {
                const response = await axios.get(`/api/use-coupon/test-booking?showtimes=${showtimes}&bookingId=${bookingId}`);
                
                setData(response.data.data[0]);
                setLoading(false);
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
                setLoading(false);
            }
        };
        if (showtimes && bookingId) {
            fetchData();
        } else {
            console.log('Missing parameters:', JSON.stringify({ showtimes, bookingId }, null, 2));
            setLoading(false);
        }
    }, [showtimes, bookingId]);

    return { data, loading, error };
}
