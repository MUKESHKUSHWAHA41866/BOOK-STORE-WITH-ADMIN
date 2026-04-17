import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BookCard from "../BookCard/BookCard";
import Loader from "../Loader/Loader";
import api from "../../api";

const RecentlyAdded = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const response = await api.get("/api/v1/get-recent-books");
        setData(response.data.data);
      } catch (error) {
        toast.error("Failed to load recent books");
        setData([]);
      }
    };
    fetchRecentBooks();
  }, []);

  return (
    <div className="mt-12 px-4 transition-colors duration-300">
      <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Recently Added</h4>
      {!data && (
        <div className="flex items-center justify-center my-8">
          <Loader />
        </div>
      )}
      <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8">
        {data && data.map((book) => (
          <BookCard key={book._id} data={book} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyAdded;