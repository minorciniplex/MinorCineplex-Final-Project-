// import React, { useEffect, useState } from "react";
// import { supabase } from "@/utils/supabase";
// import CouponCard from "@/components/Coupon/CouponCard";
// import NavbarByCinema from "../../components/sections/NavbarByCinema/NavbarByCinema";
// import FooterSection from "../../components/sections/FooterSection/FooterSection";


// const COUPON_TABS = [
//   { label: "All coupons", value: "all" },
//   { label: "UOB", value: "uob" },
//   { label: "Coke", value: "coke" },
//   { label: "KBank", value: "kbank" },
//   { label: "GSB", value: "gsb" },
//   { label: "AIS", value: "ais" },
//   { label: "Other", value: "other" },
// ];

// export default function CouponsPage() {
//   const [coupons, setCoupons] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const couponsPerPage = 8;

//   useEffect(() => {
//     async function fetchCoupons() {
//       const today = new Date().toISOString().slice(0, 10);
//       const { data, error } = await supabase
//         .from("get_coupons")
//         .select("*")
//         .eq("is_active", true)
//         .gte("valid_until", today)
//         .order("created_at", { ascending: false });
//       if (!error) setCoupons(data || []);
//     }
//     fetchCoupons();
//   }, []);

//   // ตัวอย่าง filter tab (filter ด้วย title)
//   const filteredCoupons = coupons.filter((coupon) => {
//     if (activeTab === "all") return true;
//     const title = coupon.title?.toLowerCase() || "";
//     return title.includes(activeTab);
//   });

//   // Pagination logic
//   const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);
//   const startIndex = (currentPage - 1) * couponsPerPage;
//   const endIndex = startIndex + couponsPerPage;
//   const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const renderPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;
//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(
//           <button
//             key={i}
//             onClick={() => handlePageChange(i)}
//             className={`w-8 h-8 flex items-center justify-center mx-1 rounded ${currentPage === i ? "bg-green-400 text-white" : "bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"}`}
//           >
//             {i}
//           </button>
//         );
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 3; i++) {
//           pages.push(
//             <button
//               key={i}
//               onClick={() => handlePageChange(i)}
//               className={`w-8 h-8 flex items-center justify-center mx-1 rounded ${currentPage === i ? "bg-green-400 text-white" : "bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"}`}
//             >
//               {i}
//             </button>
//           );
//         }
//         pages.push(<span key="dots1" className="text-base-gray-300 mx-1">...</span>);
//         pages.push(
//           <button
//             key={totalPages}
//             onClick={() => handlePageChange(totalPages)}
//             className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//           >
//             {totalPages}
//           </button>
//         );
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(
//           <button
//             key={1}
//             onClick={() => handlePageChange(1)}
//             className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//           >
//             1
//           </button>
//         );
//         pages.push(<span key="dots2" className="text-base-gray-300 mx-1">...</span>);
//         for (let i = totalPages - 2; i <= totalPages; i++) {
//           pages.push(
//             <button
//               key={i}
//               onClick={() => handlePageChange(i)}
//               className={`w-8 h-8 flex items-center justify-center mx-1 rounded ${currentPage === i ? "bg-green-400 text-white" : "bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"}`}
//             >
//               {i}
//             </button>
//           );
//         }
//       } else {
//         pages.push(
//           <button
//             key={1}
//             onClick={() => handlePageChange(1)}
//             className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//           >
//             1
//           </button>
//         );
//         pages.push(<span key="dots1" className="text-base-gray-300 mx-1">...</span>);
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pages.push(
//             <button
//               key={i}
//               onClick={() => handlePageChange(i)}
//               className={`w-8 h-8 flex items-center justify-center mx-1 rounded ${currentPage === i ? "bg-green-400 text-white" : "bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"}`}
//             >
//               {i}
//             </button>
//           );
//         }
//         pages.push(<span key="dots2" className="text-base-gray-300 mx-1">...</span>);
//         pages.push(
//           <button
//             key={totalPages}
//             onClick={() => handlePageChange(totalPages)}
//             className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//           >
//             {totalPages}
//           </button>
//         );
//       }
//     }
//     return pages;
//   };

//   // reset page when filter tab changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, filteredCoupons.length]);

//   return (
//     <div className="min-h-screen bg-background">
//       <NavbarByCinema />
//       <div className="flex-1 py-10 px-0 md:px-0">
//         {/* Tabs with background */}
//         <div className="w-full h-[118px] relative mt-[40px] mb-[20px] z-10">
//           <div className="w-full h-[118px] bg-base-gray-0 absolute left-0 top-0"></div>
//           <div className="max-w-6xl mx-auto flex items-center h-[118px] px-0 md:px-0 relative z-10">
//             <div className="flex gap-8">
//               {COUPON_TABS.map((tab) => (
//                 <button
//                   key={tab.value}
//                   className={`px-[4px] py-[3px] headline-3 transition ${activeTab === tab.value ? "text-white" : "text-base-gray-300 hover:underline"}`}
//                   style={activeTab === tab.value ? { borderBottom: '1px solid #565F7E' } : {}}
//                   onClick={() => setActiveTab(tab.value)}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//         {/* Coupon List */}
//         <div className="w-full relative z-10 mt-6">
//           <div className="max-w-6xl mx-auto px-4 md:px-0">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
//               {filteredCoupons.length === 0 ? (
//                 <div className="col-span-full text-center text-base-gray-400 py-10">Coupon not found</div>
//               ) : (
//                 paginatedCoupons.map((coupon) => (
//                   <CouponCard key={coupon.id} coupon={coupon} />
//                 ))
//               )}
//             </div>
//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-center gap-2 mt-8">
//                 <button
//                   onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
//                   className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//                   disabled={currentPage === 1}
//                 >
//                   &lt;
//                 </button>
//                 {renderPageNumbers()}
//                 <button
//                   onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
//                   className="w-8 h-8 flex items-center justify-center mx-1 rounded bg-[#23263a] text-base-gray-300 hover:bg-green-400 hover:text-white"
//                   disabled={currentPage === totalPages}
//                 >
//                   &gt;
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <FooterSection />
//     </div>
//   );
// } 