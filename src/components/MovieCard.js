import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MovieCard = ({ movie }) => {
  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={`/assets/images/${movie.image}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-500">
            {movie.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {movie.genre}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {movie.duration} นาที
            </span>
            <span className="text-sm font-medium text-gray-700">
              {movie.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 