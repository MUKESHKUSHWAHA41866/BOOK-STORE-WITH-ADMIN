import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiHome, FiBook, FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Animated 404 number */}
        <div className="relative mb-8">
          <h1 className="text-[8rem] md:text-[12rem] font-black text-zinc-800 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-yellow-400 animate-bounce">
              <FiAlertTriangle size={56} />
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          Looks like this page closed its covers. It may have been moved, deleted,
          or you might have taken a wrong turn.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <FiArrowLeft />
            Go Back
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <FiHome />
            Back to Home
          </Link>

          <Link
            to="/all-books"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <FiBook />
            Browse Books
          </Link>
        </div>

        {/* Decorative grid dots */}
        <div className="mt-16 grid grid-cols-5 gap-3 opacity-20 mx-auto w-fit">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-500"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
