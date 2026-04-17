import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api";
import { motion } from "framer-motion";

const BookCard = ({ data, favourite }) => {
  const handleRemoveFromFavorites = async () => {
    try {
      const response = await api.put(
        "/api/v1/remove-book-from-favorite",
        {},
        { headers: { bookid: data._id } }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white dark:bg-zinc-800 rounded-2xl p-4 flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-100 dark:border-zinc-700 h-full"
    >
      <Link to={`/view-book-details/${data._id}`} className="flex flex-col h-full">
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center overflow-hidden h-[30vh]">
          <img
            src={data.url}
            alt={data.title}
            className="h-full object-cover w-full transform transition-transform duration-500 hover:scale-110"
          />
        </div>
        <div className="flex flex-col flex-1">
          <h2 className="mt-4 text-xl text-zinc-900 dark:text-zinc-100 font-bold line-clamp-2 leading-tight">
            {data.title}
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium italic">by {data.author}</p>
          <div className="mt-auto pt-4 flex items-center justify-between">
            <p className="text-blue-600 dark:text-blue-400 font-extrabold text-2xl">₹ {data.price}</p>
          </div>
        </div>
      </Link>

      {favourite && (
        <button
          className="mt-4 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-600 hover:text-white dark:hover:bg-red-500 transition-all duration-300"
          onClick={handleRemoveFromFavorites}
          aria-label={`Remove ${data.title} from favorites`}
        >
          Remove
        </button>
      )}
    </motion.div>
  );
};

export default BookCard;