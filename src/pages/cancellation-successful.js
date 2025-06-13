import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CheckIcon from "@mui/icons-material/Check";
import Navbar from "@/components/Navbar/Navbar";
import Image from "next/image";
import Button from "@/components/Button";

const CancellationSuccessful = () => {
  const router = useRouter();
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    // ดึงข้อมูลจาก query parameters
    const { refund } = router.query;
    if (refund) {
      setRefundAmount(Number(refund));
    }
  }, [router.query]);

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#070C1B] text-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Success Icon */}
                      <div className="w-20 h-20 bg-[--brand-green] rounded-full flex items-center justify-center mx-auto mb-8">
              <Image src="/assets/images/Done.png" alt="Check" width={40} height={40} />
            </div>

          {/* Title */}
          <h1 className="headline-2 text-white mb-6">
            Cancellation successful
          </h1>

          {/* Description */}
          <div className=" body-2-regular text-[--base-gray-400] mb-2">
            The cancellation is complete.
          </div>
          <div className=" body-2-regular text-[--base-gray-400] mb-8 px-4 md:px-0 ">
            You will receive an email with a detail and refund within 48 hours.
          </div>

          {/* Refund Amount */}
          <div className="text-white mb-12 flex items-center justify-center gap-2">
            <span className="body-2-regular">Total refund</span>
            <span className="body-1-medium">THB{refundAmount.toLocaleString()}</span>
          </div>

          {/* Back to Home Button */}
          <Button
            onClick={handleBackToHome}
            className="!w-[343px] !h-[48px] !rounded-[4px] !body-1-medium  "
          >
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancellationSuccessful; 