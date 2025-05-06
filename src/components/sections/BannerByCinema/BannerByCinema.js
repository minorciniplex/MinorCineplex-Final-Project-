// import React, { useState } from 'react';
// import Image from 'next/image';
// import Button from '@/components/Button';
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import SearchIcon from '@mui/icons-material/Search';
// import { movieFilters } from '@/data/movies';

// const BannerByCinema = ({
//   onSearch = (filters) => console.log('Search filters:', filters),
//   bannerImage = '/assets/images/banner.jpg'
// }) => {
//   const [filters, setFilters] = useState({
//     movie: '',
//     language: '',
//     genre: '',
//     city: '',
//     releaseDate: ''
//   });

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSearch = () => {
//     onSearch(filters);
//   };

//   return (
//     <div className="relative w-full h-[400px]">
//       {/* Banner Image Container */}
//       <div className="absolute inset-0 w-full h-full overflow-hidden">
//         <Image
//           src={bannerImage}
//           alt="Cinema Banner"
//           fill
//           sizes="100vw"
//           quality={100}
//           priority
//           className="object-center"
//           style={{
//             objectPosition: '50% 35%'
//           }}
//         />
//         {/* Gradient Overlay */}
//         <div
//           className="absolute inset-0"
//           style={{
//             background: 'linear-gradient(360deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)'
//           }}
//         />
//       </div>

//       {/* Search Filters */}
//       <div className="absolute bottom-[-61.5px] left-1/2 transform -translate-x-1/2 w-[1200px] h-[123px] bg-base-gray-0 p-[40px] rounded-[14px] shadow-[0_4px_30px_0_rgba(0,0,0,0.5)]">
//         <div className="flex flex-wrap gap-[10px] justify-center items-center">
//           <div className="relative">
//             <select
//               name="movie"
//               value={filters.movie}
//               onChange={handleFilterChange}
//               className="w-[267px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
//             >
//               <option value="">Movie</option>
//               {movieFilters.movies.map(movie => (
//                 <option key={movie.id} value={movie.id}>
//                   {movie.name}
//                 </option>
//               ))}
//             </select>
//             <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
//           </div>

//           <div className="relative">
//             <select
//               name="language"
//               value={filters.language}
//               onChange={handleFilterChange}
//               className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
//             >
//               <option value="">Language</option>
//               {movieFilters.languages.map(lang => (
//                 <option key={lang.id} value={lang.id}>
//                   {lang.name}
//                 </option>
//               ))}
//             </select>
//             <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
//           </div>

//           <div className="relative">
//             <select
//               name="genre"
//               value={filters.genre}
//               onChange={handleFilterChange}
//               className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
//             >
//               <option value="">Genre</option>
//               {movieFilters.genres.map(genre => (
//                 <option key={genre.id} value={genre.id}>
//                   {genre.name}
//                 </option>
//               ))}
//             </select>
//             <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
//           </div>

//           <div className="relative">
//             <select
//               name="city"
//               value={filters.city}
//               onChange={handleFilterChange}
//               className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
//             >
//               <option value="">City</option>
//               {movieFilters.cities.map(city => (
//                 <option key={city.id} value={city.id}>
//                   {city.name}
//                 </option>
//               ))}
//             </select>
//             <ExpandMoreIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
//           </div>

//           <div className="relative">
//             <input
//               type="date"
//               name="releaseDate"
//               value={filters.releaseDate}
//               onChange={handleFilterChange}
//               className="w-[177.25px] h-[48px] bg-base-gray-100 text-base-gray-300 body-2-regular pt-[12px] pr-[12px] pb-[12px] pl-[16px] rounded-[4px] gap-[4px] border-[1px] border-base-gray-200 outline-none cursor-pointer hover:bg-[#252944] transition-colors appearance-none"
//               placeholder="Release date"
//             />
//             <CalendarTodayIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-gray-300" />
//           </div>

//           <div className="flex items-center gap-4 ml-3">
//             <Button className="w-[72px] h-[48px]" onClick={handleSearch}>
//               <SearchIcon className="w-[24px] h-[24px]" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BannerByCinema; 