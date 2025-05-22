import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

const StepProgressBar = ({ currentPath = "/booking/seats" }) => {
  const steps = [
    { id: 1, label: "Select showtime", path: "/booking/showtime" },
    { id: 2, label: "Select seat", path: "/booking/seats" },
    { id: 3, label: "Payment", path: "/booking/payment" },
  ];

  const stepRefs = useRef([]);
  const lineRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({});

  const getStepStatus = (stepPath) => {
    const currentIndex = steps.findIndex((step) => step.path === currentPath);
    const stepIndex = steps.findIndex((step) => step.path === stepPath);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const StepCircle = ({ step, status, index }) => {
    const baseClasses =
      "w-[44px] h-[44px] rounded-full flex items-center justify-center text-[20px] font-bold transition-all duration-300 relative z-10";

    if (status === "completed") {
      return (
        <div ref={(el) => (stepRefs.current[index] = el)} className={`${baseClasses} bg-[--brand-blue-200] text-white`}>
          <Check size={26} />
        </div>
      );
    }

    if (status === "active") {
      return (
        <div ref={(el) => (stepRefs.current[index] = el)} className={`${baseClasses} bg-[--brand-blue-100] text-white`}>
          {step.id}
        </div>
      );
    }

    return (
      <div
        ref={(el) => (stepRefs.current[index] = el)}
        className={`${baseClasses} bg-transparent text-gray-400 border border-[--base-gray-100]`}
      >
        {step.id}
      </div>
    );
  };

  // Update line position on mount and resize
  useEffect(() => {
    const updateLine = () => {
      const start = stepRefs.current[0];
      const end = stepRefs.current[2];

      if (start && end) {
        const startRect = start.getBoundingClientRect();
        const endRect = end.getBoundingClientRect();
        const containerRect = start.parentElement.parentElement.getBoundingClientRect();

        const left = startRect.right - containerRect.left;
        const right = endRect.left - containerRect.left;
        const width = right - left;

        setLineStyle({
          left: `${left}px`,
          width: `${width}px`,
        });
      }
    };

    updateLine();
    window.addEventListener("resize", updateLine);
    return () => window.removeEventListener("resize", updateLine);
  }, []);

  return (
    <div className="w-full bg-[--brand-gray-0] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-[320px] h-auto md:w-[468px] sm:h-[75px] sm:max-w-none">
        <div className="flex items-center justify-between relative md:gap-6">
          {/* Dynamic background line */}
          <div
            ref={lineRef}
            className="absolute top-[22px] h-px bg-gray-700 z-0 transition-all duration-300"
            style={lineStyle}
          ></div>

          {steps.map((step, index) => {
            const status = getStepStatus(step.path);

            return (
              <div key={step.id} className="flex flex-col items-center w-[100px] md:w-[140px] gap-2">
                <StepCircle step={step} status={status} index={index} />
                <span className="text-sm md:text-base font-medium transition-colors text-white">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgressBar;
