import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { StatusProvider } from '@/context/StatusContext';
import { FetchCouponProvider } from '@/context/fecthCouponContext';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };

    const handleComplete = () => {
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
      {loading ? (
        <Loading />
      ) : (
        <StatusProvider>
          <FetchCouponProvider>
            <Component {...pageProps} />
          </FetchCouponProvider>
        </StatusProvider>
      )}
    </>
  );
}
