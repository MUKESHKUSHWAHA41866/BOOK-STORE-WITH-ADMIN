import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BookCard from "../BookCard/BookCard";
import Loader from "../Loader/Loader";
import api from "../../api";

const Favourites = () => {
  const [favouriteBooks, setFavouriteBooks] = useState(null);

  const fetchFavourites = async () => {
    try {
      const response = await api.get("/api/v1/get-favourite-books");
      setFavouriteBooks(response.data.data);
    } catch (error) {
      toast.error("Failed to load favorites");
      setFavouriteBooks([]);
    }
  };

  // FIX: Removed FavouriteBooks from dependency array — it was causing infinite re-fetch loop
  useEffect(() => {
    fetchFavourites();
  }, []);

  if (!favouriteBooks) {
    return (
      <div className="flex items-center justify-center h-[100%] py-16">
        <Loader />
      </div>
    );
  }

  if (favouriteBooks.length === 0) {
    return (
      <div className="text-center h-[100%] flex flex-col items-center justify-center py-16">
        <p className="text-5xl font-semibold text-zinc-500">No Favorites Yet</p>
        <img
          src="./star1.png"
          alt="No favorites"
          className="h-[20vh] my-8"
        />
        <p className="text-zinc-400 text-lg">
          Browse books and click the heart icon to add favorites.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-300 mb-6">
        My Favorites ({favouriteBooks.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favouriteBooks.map((book) => (
          <BookCard key={book._id} data={book} favourite={true} />
        ))}
      </div>
    </div>
  );
};

export default Favourites;