import React from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useEffect } from "react";
import { useStatus } from "@/context/StatusContext";
import Link from "next/link";

const NavbarWithLogin = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataUser, setDataUser] = useState(null);
  const { isLoggedIn, checkAuthStatus } = useStatus();

  const handleLogoClick = () => {
    router.push("/home-landing"); // กลับไปหน้าแรก
  };

  const handleLogout = async () => {
    const response = await axios.post("/api/auth/logout");
    setDataUser(null);
    await checkAuthStatus();
    router.push("/home-landing");
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!isLoggedIn) {
        setDataUser(null); // Clear data when logged out
        return;
      }

      try {
        const response = await axios.get("/api/auth/check-user");

        if (isMounted) {
          if (response.data?.data) {
            setDataUser(response.data.data);
          } else {
            setDataUser(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          // ถ้า 401 ให้ล้างข้อมูลผู้ใช้ แต่ไม่ให้แอปล่ม
          if (error.response?.status === 401) {
            console.warn("User not authenticated. Clearing data.");
            setDataUser(null);
          } else {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  return (
    <>
      <header className="flex w-full mx-auto h-12 px-4 border-b border-[#21263F] bg-black/20 justify-between items-center fixed top-0 z-50 md:w-full md:max-w-none md:h-20 md:px-20 md:bg-[#00000033] md:border-base-gray-100 md:backdrop-blur-[7.5px] md:backdrop-brightness-[100%] md:[-webkit-backdrop-filter:blur(7.5px)_brightness(100%)]">
        <div
          className="relative w-[28px] h-[32px] md:w-[42px] md:h-12 cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="relative w-[28px] h-[32px] md:w-[38px] md:h-[45px] top-0 left-0 md:top-[1.72px] md:left-[2px]">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={28}
              height={32}
              className="w-[28px] h-[32px] md:w-[38px] md:h-[45px]"
              priority
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:inline-flex items-center gap-6 relative self-stretch">
          <div className="px-5 flex flex-row items-center gap-4">
            {dataUser?.user_profile && (
              <img
                src={dataUser?.user_profile}
                alt="user profile"
                className="w-[40px] h-[40px] rounded-full"
              ></img>
            )}
            <p className="body-2-regular text-base-gray-400 font-bold">
              {dataUser?.name}
            </p>
          </div>
          <button onClick={() => setMenuOpen((open) => !open)}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 9L12 15L6 9" stroke="#8B93B0" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-20">
              <div className="w-[182px] h-[300px] max-w-full mx-auto rounded-none rounded-b-[16px] border-b border-[#21263F] bg-black/40 backdrop-blur-[15px] pt-6 pr-4 pb-6 flex flex-col justify-center ">
                {/* Booking history */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
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
                      stroke="#8B93B0"
                    />
                    <path
                      d="M12.5 8.33301V6.66634"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 7.5H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 10.833H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 14.167H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Booking history
                  </span>
                </Button>
                {/* My coupons */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
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
                      stroke="#8B93B0"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray-400 font-bold">
                    My coupons
                  </span>
                </Button>
                {/* Profile */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
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
                      stroke="#8B93B0"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="9.99935"
                      cy="6.66634"
                      rx="3.33333"
                      ry="3.33333"
                      stroke="#8B93B0"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Profile
                  </span>
                </Button>
                {/* Reset password */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashborad/reset-password");
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="px-2"
                  >
                    <path d="M14 15L10 19L14 23" stroke="#8B93B0" />
                    <path
                      d="M5.93782 15.5C5.14475 14.1264 4.84171 12.5241 5.07833 10.9557C5.31495 9.38734 6.07722 7.94581 7.24024 6.86729C8.40327 5.78877 9.8981 5.13721 11.4798 5.01935C13.0616 4.90149 14.6365 5.32432 15.9465 6.21856C17.2565 7.1128 18.224 8.42544 18.6905 9.94144C19.1569 11.4574 19.0947 13.0869 18.5139 14.5629C17.9332 16.0389 16.8684 17.2739 15.494 18.0656C14.1196 18.8573 12.517 19.1588 10.9489 18.9206"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Reset password
                  </span>
                </Button>
                <svg
                  width="150"
                  height="2"
                  viewBox="0 0 150 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    y1="1"
                    x2="150"
                    y2="1"
                    stroke="#565F7E"
                    stroke-width="1"
                  />
                </svg>
                {/* Log out */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
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
                      d="M1.66602 9.99967L1.27558 9.68733L1.0257 9.99967L1.27558 10.312L1.66602 9.99967ZM9.16602 10.4997C9.44216 10.4997 9.66602 10.2758 9.66602 9.99967C9.66602 9.72353 9.44216 9.49967 9.16602 9.49967V10.4997ZM4.60891 5.52066L1.27558 9.68733L2.05645 10.312L5.38978 6.14536L4.60891 5.52066ZM1.27558 10.312L4.60891 14.4787L5.38978 13.854L2.05645 9.68733L1.27558 10.312ZM1.66602 10.4997H9.16602V9.49967H1.66602V10.4997Z"
                      fill="#8B93B0"
                    />
                    <path
                      d="M8.33398 6.77694V6.6143C8.33398 5.10144 8.33398 4.34501 8.75165 3.80472C8.78814 3.75751 8.82673 3.71196 8.8673 3.6682C9.33158 3.16739 10.0777 3.04304 11.57 2.79432V2.79432C14.5994 2.28942 16.1141 2.03697 17.1437 2.81571C17.2319 2.88239 17.3163 2.9539 17.3966 3.02991C18.334 3.91746 18.334 5.45307 18.334 8.52429V11.4764C18.334 14.5476 18.334 16.0832 17.3966 16.9707C17.3163 17.0467 17.2319 17.1183 17.1437 17.1849C16.1141 17.9637 14.5989 17.7111 11.5685 17.2061V17.2061C10.0779 16.9576 9.33262 16.8334 8.86859 16.3338C8.82712 16.2892 8.78771 16.2427 8.75049 16.1944C8.33398 15.6546 8.33398 14.8993 8.33398 13.3886V13.3886"
                      stroke="#8B93B0"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Log out
                  </span>
                </Button>
              </div>
            </div>
          )}
        </nav>
        {/* Hamburger for mobile */}
        <button
          className="block md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-6 h-6 md:w-8 md:h-8 " />
        </button>
        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="md:hidden fixed left-0 right-0 top-12 z-[9999] w-full min-h-[176px] flex items-center justify-center">
            <div className="w-full h-[400px] max-w-full mx-auto rounded-none rounded-b-[16px] border-b border-[#21263F] bg-black/40 backdrop-blur-[15px] pt-6 pr-4 pb-6 flex flex-col justify-center ">
              <div className="px-5 py-4 flex flex-row items-center gap-4">
                {dataUser?.user_profile && (
                  <img
                    src={dataUser?.user_profile}
                    alt="user profile"
                    className="w-[40px] h-[40px] rounded-full "
                  ></img>
                )}
                <p className="body-2-regular text-base-gray-400 font-bold">
                  {dataUser?.name}
                </p>
              </div>
              <div className="flex flex-col items-center">
                {/* Booking History */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
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
                      stroke="#8B93B0"
                    />
                    <path
                      d="M12.5 8.33301V6.66634"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 7.5H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 10.833H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.33398 14.167H6.66732"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Booking history
                  </span>
                </Button>
                {/* My coupons */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
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
                      stroke="#8B93B0"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray-400 font-bold">
                    My coupons
                  </span>
                </Button>
                {/* Profile (Mobile) */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
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
                      stroke="#8B93B0"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="9.99935"
                      cy="6.66634"
                      rx="3.33333"
                      ry="3.33333"
                      stroke="#8B93B0"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Profile
                  </span>
                </Button>
                {/* Reset password */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashborad/reset-password");
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="px-2"
                  >
                    <path d="M14 15L10 19L14 23" stroke="#8B93B0" />
                    <path
                      d="M5.93782 15.5C5.14475 14.1264 4.84171 12.5241 5.07833 10.9557C5.31495 9.38734 6.07722 7.94581 7.24024 6.86729C8.40327 5.78877 9.8981 5.13721 11.4798 5.01935C13.0616 4.90149 14.6365 5.32432 15.9465 6.21856C17.2565 7.1128 18.224 8.42544 18.6905 9.94144C19.1569 11.4574 19.0947 13.0869 18.5139 14.5629C17.9332 16.0389 16.8684 17.2739 15.494 18.0656C14.1196 18.8573 12.517 19.1588 10.9489 18.9206"
                      stroke="#8B93B0"
                      stroke-linecap="round"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray-400 font-bold">
                    Reset password
                  </span>
                </Button>
                <svg
                  width="343"
                  height="20"
                  viewBox="0 0 343 1"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="py-2"
                >
                  <line y1="0.5" x2="343" y2="0.5" stroke="#565F7E" />
                </svg>
                {/* Log out */}
                <Button
                  variant="ghost"
                  className="w-full body-2-regular"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
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
                      d="M1.66602 9.99967L1.27558 9.68733L1.0257 9.99967L1.27558 10.312L1.66602 9.99967ZM9.16602 10.4997C9.44216 10.4997 9.66602 10.2758 9.66602 9.99967C9.66602 9.72353 9.44216 9.49967 9.16602 9.49967V10.4997ZM4.60891 5.52066L1.27558 9.68733L2.05645 10.312L5.38978 6.14536L4.60891 5.52066ZM1.27558 10.312L4.60891 14.4787L5.38978 13.854L2.05645 9.68733L1.27558 10.312ZM1.66602 10.4997H9.16602V9.49967H1.66602V10.4997Z"
                      fill="#8B93B0"
                    />
                    <path
                      d="M8.33398 6.77694V6.6143C8.33398 5.10144 8.33398 4.34501 8.75165 3.80472C8.78814 3.75751 8.82673 3.71196 8.8673 3.6682C9.33158 3.16739 10.0777 3.04304 11.57 2.79432V2.79432C14.5994 2.28942 16.1141 2.03697 17.1437 2.81571C17.2319 2.88239 17.3163 2.9539 17.3966 3.02991C18.334 3.91746 18.334 5.45307 18.334 8.52429V11.4764C18.334 14.5476 18.334 16.0832 17.3966 16.9707C17.3163 17.0467 17.2319 17.1183 17.1437 17.1849C16.1141 17.9637 14.5989 17.7111 11.5685 17.2061V17.2061C10.0779 16.9576 9.33262 16.8334 8.86859 16.3338C8.82712 16.2892 8.78771 16.2427 8.75049 16.1944C8.33398 15.6546 8.33398 14.8993 8.33398 13.3886V13.3886"
                      stroke="#8B93B0"
                    />
                  </svg>

                  <span className="w-full text-left text-base-gray- font-bold">
                    Log out
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default NavbarWithLogin;
