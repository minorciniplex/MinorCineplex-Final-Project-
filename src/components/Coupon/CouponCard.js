import Button from "../Button";
import Image from "next/image";

const CouponCard = ({ coupon }) => {

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div
      key={coupon.id}
      className="w-full bg-[#070C1B] flex flex-col items-start justify-center rounded-[8px] shadow-md overflow-hidden group cursor-pointer"
    >
      <div
        className="w-full h-[160px] md:w-[285px] md:h-[285px] bg-cover bg-center transition-transform duration-300 group-hover:scale-105 flex items-center justify-center"
      >
        {coupon.image_url ? (
          <Image
            src={coupon.image_url}
            alt={coupon.title}
            width={285}
            height={285}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-base-gray-100">No Image</div>
        )}
      </div>

      <div className="flex flex-col items-start justify-between pt-3 pb-4 px-4 md:pt-4 md:pb-6 md:px-6 w-full bg-basegray-0 flex-1">
        <div className="flex flex-col gap-2 w-full flex-1">
          <h3 className="text-basewhite font-bold text-left text-sm md:headline-4 group-hover:text-brandblue-100 transition-colors duration-200 max-w-full line-clamp-2">
            {truncateText(coupon.title, 70)}
          </h3>

          <div className="flex items-center gap-2 w-full text-xs md:text-base">
            <span className="text-base-gray-300 md:body-2-regular whitespace-nowrap">
              Valid until
            </span>
            <span className="text-base-gray-400 md:body-2-medium flex-1 truncate">
              {coupon.valid_until}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full !h-[40px] md:!w-[237px] md:!h-[48px] !rounded-[4px] !px-0 !body-1-medium mt-3"
        >
          Get coupon
        </Button>
      </div>
    </div>
  );
};

export default CouponCard; 