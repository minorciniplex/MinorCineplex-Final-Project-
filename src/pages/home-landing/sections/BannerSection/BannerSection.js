import React from 'react';
import Image from 'next/image';

const BannerSection = () => {
  return (
    <div className="relative w-full h-[600px]">
      {/* Search Filters */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-6xl">
        <div className="flex gap-4 justify-center items-center">
          <select className="bg-[#1C1F37] text-white px-6 py-3 rounded-md min-w-[150px]">
            <option value="">Movie</option>

          </select>
          <select className="bg-[#1C1F37] text-white px-6 py-3 rounded-md min-w-[150px]">
            <option value="">Languagexx</option>

          </select>
          <select className="bg-[#1C1F37] text-white px-6 py-3 rounded-md min-w-[150px]">
            <option value="">Genre</option>

          </select>
          <select className="bg-[#1C1F37] text-white px-6 py-3 rounded-md min-w-[150px]">
            <option value="">City</option>
          </select>
          <input
            type="date"
            className="bg-[#1C1F37] text-white px-6 py-3 rounded-md"
            placeholder="Release date"
          />
          <button className="bg-[#4A6EE0] text-white px-6 py-3 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerSection; 