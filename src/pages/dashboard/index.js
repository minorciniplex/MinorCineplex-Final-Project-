import { useRouter } from "next/router";
import Navbar from "@/components/Navbar/Navbar";
import Button from "@/components/Button";
import ProfileUpload from "./profile/index";
import { useEffect, useState } from "react";
import MyCoupon from "./my-coupons/index";
import ResetPassword from "./reset-password/index";
import BookingHistory from "./booking-history/index";
import { useStatus } from "@/context/StatusContext";
function Dashboard() {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState("");
  const { isLoggedIn, user } = useStatus();

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  useEffect(() => {
    if (router.query.tab) {
      setActiveComponent(router.query.tab);
    }
  }, [router.query.tab]);


  return (
    <>
      <Navbar />
      <div className="flex flex-col lg:flex-row justify-start pt-[48px] lg:pt-52 lg:pl-80">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-col w-full lg:w-[300px] h-auto lg:h-[288px] bg-[#070C1B] justify-evenly items-center lg:items-start px-4 rounded-lg shadow-[4px_4px_30px_0px_rgba(0,0,0,0.5)]">
          <div
            className={`w-full body-2-regular hover:bg-[#2A3149] hover:text-white ${
              activeComponent === "booking" ? "bg-[#21263F] text-black" : ""
            }`}
          >
            <Button
              variant="ghost"
              onClick={() => handleComponentChange("booking")}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="px-2"
              >
                <rect
                  x="5"
                  y="3.33301"
                  width="10.8333"
                  height="14.1667"
                  rx="2"
                  stroke={activeComponent === "booking" ? "#FFFFFF" : "#8B93B0"}
                />
                <path
                  d="M12.5 8.33301V6.66634"
                  stroke={activeComponent === "booking" ? "#FFFFFF" : "#8B93B0"}
                  strokeLinecap="round"
                />
                <path
                  d="M3.33398 7.5H6.66732"
                  stroke={activeComponent === "booking" ? "#FFFFFF" : "#8B93B0"}
                  strokeLinecap="round"
                />
                <path
                  d="M3.33398 10.833H6.66732"
                  stroke={activeComponent === "booking" ? "#FFFFFF" : "#8B93B0"}
                  strokeLinecap="round"
                />
                <path
                  d="M3.33398 14.167H6.66732"
                  stroke={activeComponent === "booking" ? "#FFFFFF" : "#8B93B0"}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`w-full text-left font-bold ${
                  activeComponent === "booking"
                    ? "text-white"
                    : "text-base-gray-400"
                }`}
              >
                Booking history
              </span>
            </Button>
          </div>
          <div
            className={`w-full body-2-regular hover:bg-[#2A3149]  ${
              activeComponent === "coupons" ? "bg-[#21263F] text-white" : ""
            }`}
          >
            <Button
              variant="ghost"
              onClick={() => handleComponentChange("coupons")}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="px-2"
              >
                <path
                  d="M8.12535 11.4212L11.8754 7.74477M8.12535 7.74477H8.1336M11.8671 11.4212H11.8754M2.84829 7.63007C2.66229 7.63007 2.49204 7.48154 2.50029 7.28815C2.55054 6.15433 2.69154 5.4161 3.08529 4.83227C3.30989 4.49957 3.59156 4.20751 3.9178 3.96904C4.79156 3.33301 6.02533 3.33301 8.49436 3.33301H11.5049C13.9739 3.33301 15.2077 3.33301 16.0829 3.96904C16.4062 4.20433 16.6882 4.49624 16.9147 4.83227C17.3085 5.4161 17.4495 6.15433 17.4997 7.28815C17.508 7.48154 17.3377 7.63007 17.151 7.63007C16.1114 7.63007 15.2684 8.50433 15.2684 9.58301C15.2684 10.6617 16.1114 11.5359 17.151 11.5359C17.3377 11.5359 17.508 11.6845 17.4997 11.8786C17.4495 13.0117 17.3085 13.7499 16.9147 14.3345C16.69 14.6669 16.4084 14.9587 16.0822 15.197C15.2077 15.833 13.9739 15.833 11.5049 15.833H8.49511C6.02608 15.833 4.79231 15.833 3.91705 15.197C3.59107 14.9584 3.30967 14.6664 3.08529 14.3337C2.69154 13.7499 2.55054 13.0117 2.50029 11.8779C2.49204 11.6845 2.66229 11.5359 2.84829 11.5359C3.8878 11.5359 4.73081 10.6617 4.73081 9.58301C4.73081 8.50433 3.8878 7.63007 2.84829 7.63007Z"
                  stroke={activeComponent === "coupons" ? "#FFFFFF" : "#8B93B0"}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`w-full text-left font-bold ${
                  activeComponent === "coupons"
                    ? "text-white"
                    : "text-base-gray-400"
                }`}
              >
                My coupons
              </span>
            </Button>
          </div>
          <div
            className={`w-full body-2-regular hover:bg-[#2A3149] hover:text-white ${
              activeComponent === "profile" ? "bg-[#21263F] text-white" : ""
            }`}
          >
            <Button
              variant="ghost"
              onClick={() => handleComponentChange("profile")}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="px-2"
              >
                <path
                  d="M16.4402 17.0389C16.0603 15.9757 15.2234 15.0363 14.0591 14.3662C12.8948 13.6962 11.4682 13.333 10.0007 13.333C8.53309 13.333 7.10654 13.6962 5.94224 14.3662C4.77795 15.0363 3.94098 15.9757 3.56115 17.0389"
                  stroke={activeComponent === "profile" ? "#FFFFFF" : "#8B93B0"}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <ellipse
                  cx="9.99935"
                  cy="6.66634"
                  rx="3.33333"
                  ry="3.33333"
                  stroke={activeComponent === "profile" ? "#FFFFFF" : "#8B93B0"}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`w-full text-left font-bold ${
                  activeComponent === "profile"
                    ? "text-white"
                    : "text-base-gray-400"
                }`}
              >
                Profile
              </span>
            </Button>
          </div>

          <div
            className={`w-full body-2-regular hover:bg-[#2A3149] hover:text-white ${
              activeComponent === "reset" ? "bg-[#21263F] text-white" : ""
            }`}
          >
            <Button
              variant="ghost"
              onClick={() => handleComponentChange("reset")}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="px-2"
              >
                <path
                  d="M14 15L10 19L14 23"
                  stroke={activeComponent === "reset" ? "#FFFFFF" : "#8B93B0"}
                />
                <path
                  d="M5.93782 15.5C5.14475 14.1264 4.84171 12.5241 5.07833 10.9557C5.31495 9.38734 6.07722 7.94581 7.24024 6.86729C8.40327 5.78877 9.8981 5.13721 11.4798 5.01935C13.0616 4.90149 14.6365 5.32432 15.9465 6.21856C17.2565 7.1128 18.224 8.42544 18.6905 9.94144C19.1569 11.4574 19.0947 13.0869 18.5139 14.5629C17.9332 16.0389 16.8684 17.2739 15.494 18.0656C14.1196 18.8573 12.517 19.1588 10.9489 18.9206"
                  stroke={activeComponent === "reset" ? "#FFFFFF" : "#8B93B0"}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`w-full text-left font-bold ${
                  activeComponent === "reset"
                    ? "text-white"
                    : "text-base-gray-400"
                }`}
              >
                Reset password
              </span>
            </Button>
          </div>
        </div>
        <div className="flex-1">
          {activeComponent === "profile" && <ProfileUpload />}
          {activeComponent === "coupons" && <MyCoupon />}
          {activeComponent === "booking" && <BookingHistory />}
          {activeComponent === "reset" && <ResetPassword />}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
