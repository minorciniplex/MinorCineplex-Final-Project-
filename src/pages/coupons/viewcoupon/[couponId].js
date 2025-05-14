import axios from 'axios';
import {useState, useEffect} from 'react';
import { useRouter } from 'next/router';

export default function Viewcoupon() {
    const router = useRouter();
    const {couponId} = router.query;
    const [data, setData] = useState(null);
    console.log(data);
    const fetchCoupon = async () => {
        try {
            const response = await axios.get(`/api/coupons/get-coupons-id?coupon_id=${couponId}`);
            setData(response.data.coupon);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (couponId) {
            fetchCoupon();
        }
    }, [couponId]);

    return (
        <div>
            {data ? (
                <div className='flex flex-col gap-4'>
                <img src={data.image} alt={data.title} />
                <h1>{data.title}</h1>
                <p>{data.description}</p>
                <p>{data.discount_type}</p>
                <p>{data.discount_value}</p>
                <p>{data.min_purchase}</p>
                <p>{data.start_date}</p>
                <p>{data.end_date}</p>
                </div>
            ) : (
                <p>กำลังโหลด...</p>
            )}
        </div>
    )
}
