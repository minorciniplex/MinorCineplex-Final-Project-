import React from "react";
import Image from "next/image";

const FooterSection = () => (
  <footer className="w-full h-[200px] bg-base-gray-0 flex flex-col items-center justify-center relative">
    <Image
      src="/assets/images/Logo-Footing.png"
      alt="MINOR CINEPLEX Logo"
      width={200}
      height={85}
      className="w-[188px] h-[85px] "
      priority
    />
    <div className="absolute bottom-4 left-0 right-0 text-base-gray-400 text-sm text-center">
      © {new Date().getFullYear()} minorcineplex.com. All rights reserved.
    </div>
  </footer>
);

export default FooterSection; 