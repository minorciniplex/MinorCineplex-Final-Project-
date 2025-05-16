import React from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';


const NavbarLoading = () => {
     const router = useRouter();
     const [menuOpen, setMenuOpen] = useState(false);

     const handleLogin = () => {
          router.push("/auth/login");
     };

     const handleRegister = () => {
          router.push("/auth/register");
     };

     const handleLogoClick = () => {
          router.push("/home-landing"); // กลับไปหน้าแรก
     };

   

     return (
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
                    
               </nav>
               {/* Hamburger for mobile */}
               <button
                 className="block md:hidden text-white focus:outline-none"
                 onClick={() => setMenuOpen((open) => !open)}
                 aria-label="Toggle menu"
               >
                 {/* <MenuIcon className="w-6 h-6 md:w-8 md:h-8" /> */}
               </button>
               {/* Mobile Menu Overlay */}
               {menuOpen && (
                 <div className="fixed left-0 right-0 top-12 z-[9999] w-full min-h-[176px] flex items-start justify-center">
                   <div className="w-[375px] h-[200px] max-w-full mx-auto rounded-none rounded-b-[16px] border-b border-[#21263F] bg-black/40 backdrop-blur-[15px] pt-6 pr-4 pb-6 pl-4 flex flex-col items-center justify-center gap-6">
                 
                   </div>
                 </div>
               )}
          </header>
     );
};

export default NavbarLoading; 