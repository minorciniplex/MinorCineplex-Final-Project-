import React from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";

const NavbarByCinema = () => {
     const router = useRouter();

     const handleLogin = () => {
          router.push("/auth/login");
     };

     const handleRegister = () => {
          router.push("/auth/register");
     };

     return (
          <header className="flex w-full h-20 items-center justify-between px-20 py-0 bg-[#00000033] border-b border-base-gray-100 backdrop-blur-[7.5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(7.5px)_brightness(100%)] fixed top-0 z-50">
               <div className="relative w-[42px] h-12">
                    <div className="relative w-[38px] h-[45px] top-[1.72px] left-[2px]">
                         <Image
                              src="/assets/images/logo.png"
                              alt="Logo"
                              width={38}
                              height={45}
                              priority
                         />
                    </div>
               </div>

               <nav className="inline-flex items-center gap-6 relative self-stretch">
                    <Button
                         variant="ghost"
                         className="text-white hover:text-white/80"
                         onClick={handleLogin}
                    >
                         Login
                    </Button>

                    <Button
                         variant="secondary"
                         className="!w-[123px] !h-[48px] !rounded-[4px] !px-0"
                         onClick={handleRegister}
                    >
                         Register
                    </Button>
               </nav>
          </header>
     );
};

export default NavbarByCinema; 