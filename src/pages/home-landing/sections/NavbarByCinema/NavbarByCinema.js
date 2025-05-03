import Button from "@/components/Button";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const NavbarByCinema = () => {
  return (
    <header className="flex w-full h-[80px] items-center justify-between px-[80px] py-0 bg-black/20 border-b-[1px] border-b-base-gray-100 backdrop-blur-[7.5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(7.5px)_brightness(100%)] fixed z-50">
      <Link href="/home-landing" className="relative w-[42px] h-12 cursor-pointer">
        <div className="relative w-[38px] h-[45px] top-0.5 left-0.5">
          <Image 
            src="/assets/images/logo.png"
            alt="Logo" 
            fill
            sizes="38px"
            className="absolute top-[1.72px] left-[2px]"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      <nav className="inline-flex items-center gap-6 relative self-stretch">
        <button className="px-6 py-4 h-auto font-normal text-basegray-400 text-base font-['Roboto_Condensed',Helvetica]">
          Login
        </button>
        <Button variant="secondary">Register</Button>
      </nav>
    </header>
  );
};

export default NavbarByCinema;
