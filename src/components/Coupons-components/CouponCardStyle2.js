import Image from "next/image";
import { useRouter } from "next/router";
export default function CouponCardStyle2({image, title, end_date, coupon_id}) {
    const router = useRouter();
    const dateFormat = new Date(end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return (
        <div className="w-[464px] h-[174px] flex rounded-lg border-2">
           <div>
            <Image 
            src={image} 
            alt={title} 
            width={285} 
            height={160} 
            className=" w-[174px] h-[174px]"
            />
           </div>
           <div className="w-[290px] h-[174px] flex flex-col justify-center ml-4">
            <div className="w-[242px] h-[80px] flex items-center text-basewhite font-bold text-left text-sm md:headline-4 group-hover:text-brandblue-100 transition-colors duration-200 max-w-full line-clamp-2">
                {title}
            </div>
            <p>Valid until {dateFormat} 
            </p>
            <div>
            <button onClick={() => router.push(`/coupons/viewcoupon/${coupon_id}`)} >View detail</button>
           </div>
           </div>
           
        </div>
    )
}

