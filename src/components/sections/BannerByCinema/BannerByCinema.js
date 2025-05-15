import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { supabase } from '@/utils/supabase';

const BannerByCinema = ({
  onSearch = (filters) => console.log('Search filters:', filters),
  bannerImage = '/assets/images/banner.jpg'
}) => {
  const [filters, setFilters] = useState({
    movie: '',
    language: '',
    genre: '',
    city: '',
    releaseDate: ''
  });
  const [movieList, setMovieList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // ดึงรายชื่อหนัง
      const { data: movies } = await supabase
        .from('movies')
        .select('movie_id, title, original_language, genres');
      if (movies) {
        setMovieList(movies);
        const langs = Array.from(new Set(movies.map(m => m.original_language).filter(Boolean)));
        setLanguageList(langs);
        const allGenres = movies.flatMap(m => Array.isArray(m.genres) ? m.genres : []);
        setGenreList(Array.from(new Set(allGenres)));
      }
      // ดึงรายชื่อจังหวัด/เมืองจาก cinemas
      const { data: cinemas } = await supabase
        .from('cinemas')
        .select('province');
      if (cinemas) {
        const provinces = Array.from(new Set(cinemas.map(c => c.province).filter(Boolean)));
        setCityList(provinces);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="relative w-full h-[267px] md:h-[400px] flex flex-col items-center justify-center">
      {/* Banner Image Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Banner สำหรับมือถือ */}
        <Image
          src={'/assets/images/banner-mobile.jpg'}
          alt="Cinema Banner Mobile"
          fill
          sizes="100vw"
          quality={100}
          priority
          className="object-cover object-center block md:hidden"
          style={{ objectPosition: '50% 130%' }}
        />
        {/* Banner สำหรับ desktop */}
        <Image
          src={bannerImage}
          alt="Cinema Banner"
          fill
          sizes="100vw"
          quality={100}
          priority
          className="object-cover object-center hidden md:block"
          style={{ objectPosition: '50% 35%' }}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(360deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)' }}
        />
      </div>

      {/* Search Filters */}
      <div className="relative z-10 mt-[300px] md:mt-0 max-w-[344px] w-[344px] rounded-[4px] p-[16px] bg-[#070C1B] md:bg-base-gray-0 md:p-[40px] md:rounded-[4px] shadow-[0_4px_30px_0_rgba(0,0,0,0.5)] md:absolute md:bottom-[-61.5px] md:left-1/2 md:transform md:-translate-x-1/2 md:w-[1200px] md:h-[128px] md:max-w-none">
        {/* Desktop layout */}
        <div className="hidden md:flex md:flex-row md:gap-[10px] w-full">
          <div className="relative">
            <select
              name="movie"
              value={filters.movie}
              onChange={handleFilterChange}
              className="w-[267px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
            >
              <option value="">Movie</option>
              {movieList.map(movie => (
                <option key={movie.movie_id} value={movie.movie_id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="relative">
            <select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
            >
              <option value="">Language</option>
              {languageList.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="relative">
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
            >
              <option value="">Genre</option>
              {genreList.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="relative">
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
            >
     แก้เ         <option value="">City</option>
              {cityList.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="relative">
            <input
              type="date"
              name="releaseDate"
              value={filters.releaseDate}
              onChange={handleFilterChange}
              className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
              placeholder="Release date"
            />
            <CalendarTodayIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="flex items-center gap-4 ml-3">
            <Button className="!w-[72px] !h-[48px] !rounded-[4px] !px-0" onClick={handleSearch}>
              <SearchIcon className="w-[24px] h-[24px]" />
            </Button>
          </div>
        </div>
        {/* Mobile layout */}
        <div className="flex flex-col gap-2 md:hidden">
          <div className="relative w-full">
            <select
              name="movie"
              value={filters.movie}
              onChange={handleFilterChange}
              className="w-full h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
            >
              <option value="">Movie</option>
              {movieList.map(movie => (
                <option key={movie.movie_id} value={movie.movie_id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
          </div>
          <div className="flex flex-row gap-2">
            <div className="relative w-full flex-1">
              <select
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                className="w-full h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
              >
                <option value="">Language</option>
                {languageList.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
            </div>
            <div className="relative w-full flex-1">
              <select
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="w-full h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
              >
                <option value="">Genre</option>
                {genreList.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="relative w-full flex-1">
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
              >
                <option value="">City</option>
                {cityList.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
            </div>
            <div className="relative w-full flex-1">
              <input
                type="date"
                name="releaseDate"
                value={filters.releaseDate}
                onChange={handleFilterChange}
                className="w-full h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
                placeholder="Release date"
              />
              <CalendarTodayIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <Button className="!w-[72px] !h-[48px] !rounded-[4px] !px-0" onClick={handleSearch}>
              <SearchIcon className="w-[24px] h-[24px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerByCinema; 