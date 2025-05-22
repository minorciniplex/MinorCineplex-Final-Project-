import Button from '../Button';

export default function SelectedSeat({ seats = [], total = "", onNext }) {
     return (
          <div className="bg-[#070C1B] w-[375px] h-[164px]  -mx-4 px-[16px] pt-6 pb-11 flex flex-col gap-4 border-t border-[#21263F]">
               <div>
                    <div className="flex justify-between items-center mt-[-10px] mb-1 ">
                         <span className="text-base-gray-400 body-2-regular">Selected Seat</span>
                         <span className="text-white body-1-medium">{Array.isArray(seats) ? seats.join(", ") : seats}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-base-gray-400 body-2-regular">Total</span>
                         <span className="text-white body-1-medium">{total}</span>
                    </div>
               </div>
               {/* Next Button */}
               <Button className="!w-[343px] !h-[48px]  !rounded-[4px] self-center">
                    Next
               </Button>
          </div>
     );
} 