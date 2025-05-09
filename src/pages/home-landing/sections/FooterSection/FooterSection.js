import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const FooterSection = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/home-landing"); // กลับไปหน้าแรก
  };

  return (
    <footer className="w-full h-auto md:h-[200px] bg-base-gray-0 flex flex-col items-center justify-center relative py-8 md:py-0">
      <div 
        className="cursor-pointer" 
        onClick={handleLogoClick}
      >
        <Image
          src="/assets/images/Logo-Footing.png"
          alt="MINOR CINEPLEX Logo"
          width={200}
          height={85}
          className="w-[150px] md:w-[188px] h-auto md:h-[85px]"
          priority
        />
      </div>
      <div className="mt-4 md:mt-0 md:absolute md:bottom-4 left-0 right-0 text-base-gray-400 text-sm text-center">
        © {new Date().getFullYear()} minorcineplex.com. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterSection; 