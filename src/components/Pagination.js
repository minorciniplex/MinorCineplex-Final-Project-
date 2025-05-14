import React from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = currentPage === i;
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={isActive}
          className={`
            w-8 h-8 mx-1 rounded
            flex items-center justify-center
            text-base font-medium
            transition
            ${isActive
              ? "bg-[#5A617A] text-white cursor-default"
              : "bg-transparent text-[#A0AEC0] hover:bg-[#232B3E] hover:text-white"}
          `}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          w-8 h-8 rounded flex items-center justify-center
          text-[#A0AEC0] hover:bg-[#232B3E] hover:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {renderPageNumbers()}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          w-8 h-8 rounded flex items-center justify-center
          text-[#A0AEC0] hover:bg-[#232B3E] hover:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination; 