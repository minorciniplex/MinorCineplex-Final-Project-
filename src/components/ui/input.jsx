import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <div className="relative">
      <input
      type={type}
      placeholder="Search cinema"
      className={cn(
        "w-full py-3 pl-4 bg-[--base-gray-100] text-[--base-gray-300] border border-[--base-gray-200] rounded-sm focus:outline-none focus:border-[--base-gray-200] focus:ring-0 focus-visible:outline-none",
        
        className
      )}
      ref={ref}
      {...props} />
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute right-3 top-1/4 md:right-3 md:top-1/4 transform-translate-y-1/4 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
      </div>
    
  );
})
Input.displayName = "Input"

export { Input }
