import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ShowSearchCinema({
  placeholder,
  onSearch,
  value,
  onChange,
}) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  // const [cinemas, setCinemas] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    if (onChange) onChange(e);
  };

  // const sortSearchResults = (cinemas, searchQuery, selectedCinema) => {
  //   const query = searchQuery.toLowerCase().trim();

  //   return [...cinemas].sort((a, b) => {
  //     // ถ้ามีโรงหนังที่ถูกเลือก ให้แสดงเป็นอันดับแรก
  //     if (selectedCinema) {
  //       if (a.id === selectedCinema.id) return -1;
  //       if (b.id === selectedCinema.id) return 1;
  //     }
  //     const aName = a.name.toLowerCase();
  //     const bName = b.name.toLowerCase();

  //     // เช็คว่าชื่อขึ้นต้นด้วยคำค้นหาหรือไม่
  //     const aStartsWith = aName.startsWith(query);
  //     const bStartsWith = bName.startsWith(query);

  //     // เช็คว่ามีคำค้นหาอยู่ในชื่อหรือไม่
  //     const aContains = aName.includes(query);
  //     const bContains = bName.includes(query);

  //     // Priority 1: ชื่อที่ขึ้นต้นด้วยคำค้นหา
  //     if (aStartsWith && !bStartsWith) return -1;
  //     if (bStartsWith && !aStartsWith) return 1;

  //     // Priority 2: ชื่อที่มีคำค้นหาอยู่
  //     if (aContains && !bContains) return -1;
  //     if (bContains && !aContains) return 1;

  //     // Priority 3: ถ้าทั้งคู่มีคำค้นหา เรียงตามตำแหน่งที่พบ
  //     if (aContains && bContains) {
  //       const aIndex = aName.indexOf(query);
  //       const bIndex = bName.indexOf(query);
  //       if (aIndex !== bIndex) return aIndex - bIndex;
  //     }

  //     // Priority 4: เรียงตามตัวอักษร
  //     return aName.localeCompare(bName);
  //   });
  // };

  // const handleCinemaSelect = (cinema) => {
  //   setSelectedCinema(cinema);
  //   setSearchQuery(""); // เคลียร์ค่า search query
  //   setCinemas([]); // เคลียร์รายการโรงหนัง
  //   onCinemaSelect(cinema);
  // };

  // // ใช้ debounce เพื่อลดการ request ที่ไม่จำเป็น
  // const debouncedSearch = useDebounce(searchQuery, 500);

  // useEffect(() => {
  //   const fetchCinemas = async () => {
  //     if (!debouncedSearch) {
  //       // ถ้าไม่มีการค้นหา แต่มีโรงหนังที่เลือกไว้ ให้แสดงเฉพาะโรงนั้น
  //       if (selectedCinema) {
  //         setCinemas([selectedCinema]);
  //       } else {
  //         setCinemas([]);
  //       }
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       const controller = new AbortController();

  //       const response = await axios.get(
  //         "/api/movies-detail/getSearchCinemas",
  //         {
  //           params: { searchQuery: debouncedSearch },
  //           signal: controller.signal,
  //           timeout: 5000,
  //         }
  //       );

  //       if (response.data?.data) {
  //         const sortedCinemas = sortSearchResults(
  //           response.data.data,
  //           debouncedSearch,
  //           selectedCinema
  //         );
  //         setCinemas(sortedCinemas);
  //       }

  //       return () => controller.abort();
  //     } catch (err) {
  //       if (!axios.isCancel(err)) {
  //         setError(err.message);
  //         console.error("Error fetching cinemas:", err);
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCinemas();
  // }, [debouncedSearch, selectedCinema]);

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder || "Search..."}
          value={searchQuery}
          onChange={handleChange}
        />

        {/* <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button> */}

        {/* Dropdown results */}
        {/* {(loading || error || (!loading && cinemas.length > 0)) && (
        <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto z-50">
          
          {loading && (
            <div className="p-3 text-gray-500 text-center">
              Searching cinemas...
            </div>
          )}

          
          {error && <div className="p-3 text-red-500 text-center">{error}</div>}

          
          {!loading && cinemas.length > 0 && (
            <>
              {cinemas.map((cinema) => {
                const searchLower = searchQuery.toLowerCase();
                const nameLower = cinema.name.toLowerCase();
                const matchIndex = nameLower.indexOf(searchLower);
                const beforeMatch = cinema.name.slice(0, matchIndex);
                const match = cinema.name.slice(
                  matchIndex,
                  matchIndex + searchQuery.length
                );
                const afterMatch = cinema.name.slice(
                  matchIndex + searchQuery.length
                );

                return (
                  <button
                    key={cinema.id}
                    onClick={() => handleCinemaSelect(cinema)}
                    className="w-full p-3 text-left bg-[--base-gray-100] hover:bg-[--base-gray-200] flex items-start gap-2 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {matchIndex > -1 ? (
                          <>
                            {beforeMatch}
                            <span className="bg-[--base-gray-300]">
                              {match}
                            </span>
                            {afterMatch}
                          </>
                        ) : (
                          cinema.name
                        )}
                      </div>
                      {cinema.location && (
                        <div className="text-sm text-gray-500 mt-1">
                          {cinema.location}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}

          
          {!loading && cinemas.length === 0 && searchQuery && (
            <div className="p-3 text-gray-500 text-center">
              No cinemas found
            </div>
          )}
        </div>
      )} */}
      </div>
    </form>
  );
}
