import Button from "../Button";

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
      className="w-[285px] h-[477px] bg-[#070C1B] flex flex-col items-start justify-center rounded-[4px] overflow-hidden group cursor-pointer"
    >
      <div
        className="w-[285px] h-[285px] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${coupon.image})` }}
      />

      <div className="flex flex-col h-48 items-start justify-between pt-4 pb-6 px-6 w-full bg-basegray-0">
        <div className="flex items-start gap-4 w-full">
          <div className="flex flex-col items-start gap-2 flex-1">
            <h3 className="text-basewhite headline-4 text-left group-hover:text-brandblue-100 transition-colors duration-200">
              {truncateText(coupon.title, 43)}
            </h3>

            <div className="flex items-start gap-4 w-full">
              <span className="text-base-gray-300 body-2-regular text-[length:var(--body-2-regular-font-size)] leading-[var(--body-2-regular-line-height)] tracking-[var(--body-2-regular-letter-spacing)] [font-style:var(--body-2-regular-font-style)]">
                Valid until
              </span>
              <span className="text-base-gray-400 body-2-medium text-[length:var(--body-2-medium-font-size)] leading-[var(--body-2-medium-line-height)] tracking-[var(--body-2-medium-letter-spacing)] [font-style:var(--body-2-medium-font-style)] flex-1">
                {coupon.validUntil}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          className="!w-[237px] !h-[48px] !rounded-[4px] !px-0 !body-1-medium"
        >
          Get coupon
        </Button>
      </div>
    </div>
  );
};

export default CouponCard; 