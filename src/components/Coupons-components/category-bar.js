import axios from 'axios';
import { useState, useEffect } from 'react';
export default function CategoryBar() {
    const [couponOwners, setCouponOwners] = useState([]);

    const getCouponOwners = async () => {
        try {
            const res = await axios.get('/api/coupons/get-coupon-owner');
            setCouponOwners(res.data.coupons);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getCouponOwners();
    }, []);

    return (
        <div className='flex gap-2'>
            <button className='bg-brand-blue-100 text-white px-4 py-2 rounded-md hover:bg-[#070C1B] transition-colors duration-200'
             onClick={() => getCouponOwners()}>ทั้งหมด</button>
            {couponOwners.map((couponOwner) => (
                <div key={couponOwner.id}>
                    <button className='bg-brand-blue-100 text-white px-4 py-2 rounded-md hover:bg-[#070C1B] transition-colors duration-200' 
                   onClick={() => getCouponOwners(couponOwner.id)}>{couponOwner.name}</button>
                </div>
            ))}
            
        </div>
    )
}
