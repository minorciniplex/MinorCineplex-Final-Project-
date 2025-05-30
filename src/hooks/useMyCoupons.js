import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';

// ดึงคูปองของ user ตาม userId
export function useMyCoupons(userId) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    supabase
      .from('user_coupons')
      .select('id, coupon_code, description, discount, expired_at')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) setError(error);
        setCoupons(data || []);
        setLoading(false);
      });
  }, [userId]);

  return { coupons, loading, error };
} 