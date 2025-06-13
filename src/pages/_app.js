import "@/styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { StatusProvider } from '@/context/StatusContext';
import { FetchCouponProvider } from '@/context/fecthCouponContext';
import { Toaster } from 'react-hot-toast';

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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {loading ? (
        <Loading />
      ) : (
        <StatusProvider>
          <FetchCouponProvider> 
            <Component {...pageProps} />
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // Define default options
                className: '',
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                // Default options for specific types
                success: {
                  duration: 4000,
                  style: {
                    background: '#10B981',
                    color: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                  },
                },
              }}
            />
          </FetchCouponProvider>
        </StatusProvider>
      )}
    </>
  );
}
