import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <div className="relative w-3/4">
      <input
      type={type}
      placeholder="Search cinema"
      className={cn(
        "w-full py-3 pl-4 bg-[#21263F] text-[#8B93B0] border border-[#565F7E] rounded-sm focus:outline-none focus:border-[#565F7E] focus:ring-0 focus-visible:outline-none",
        
        className
      )}
      ref={ref}
      {...props} />
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
      </div>
    
  );
})
Input.displayName = "Input"

export { Input }
