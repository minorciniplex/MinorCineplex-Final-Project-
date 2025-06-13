import { useState, useEffect } from 'react';
import axios from 'axios';

const useCouponWallet = () => {
  const [couponsInWallet, setCouponsInWallet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(
        "/api/dashboard/get-all-from-user-coupon"
      );
      setCouponsInWallet(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);
  
  return {
    couponsInWallet,
    loading,
    error,
    refetch: fetchCoupons
  };
};

export default useCouponWallet;
