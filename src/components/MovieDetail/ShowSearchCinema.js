import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function ShowSearchCinema({
  placeholder,
  onSearch,
  value,
  onChange,
}) {
  const [searchQuery, setSearchQuery] = useState(value || "");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder || "Search..."}
          value={searchQuery}
          onChange={handleChange}
        />
      </div>
    </form>
  );
}
