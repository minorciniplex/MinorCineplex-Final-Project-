import React from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useStatus } from "@/context/StatusContext";
import NavbarWithLogin from "./NavbarWithLogin";
import NavbarWithOutLogin from "./NavbarWithOutLogin";
import NavbarLoading from "./NavbarLoading";

const Navbar = () => {
     
        const { isLoggedIn, loading } = useStatus();
     return (
     <>
        
     {loading ? (<NavbarLoading/>) : isLoggedIn ? (
          <NavbarWithLogin />
     ) : (
          <NavbarWithOutLogin />
     )}
     </>
     );
};

export default Navbar; 