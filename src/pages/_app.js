import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { StatusProvider } from "@/context/StatusContext";
import ScrollToTop from "@/components/ScrollToTop";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // เริ่มโหลดเมื่อเริ่มเปลี่ยนหน้า
    const handleStart = () => {
      setLoading(true);
    };

    // จบการโหลดเมื่อเปลี่ยนหน้าเสร็จ
    const handleComplete = () => {
      // เพิ่ม delay 500ms ก่อนซ่อน loading
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <>
      <StatusProvider>
      {loading ? <Loading /> : <Component {...pageProps} />}
      </StatusProvider>
      
      <ScrollToTop />
    </>
  );
}
