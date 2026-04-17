import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import ImageUpload from "../components/ImageUpload/ImageUpload";
import { motion } from "framer-motion";

const GENRE_OPTIONS = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller",
  "Romance", "Horror", "Biography", "History", "Self-Help", "Business",
  "Technology", "Science", "Children", "Young Adult", "Poetry", "Classics",
];

const AddBook = () => {
  const [data, setData] = useState({
    url: "", title: "", author: "", price: "", desc: "", language: "", isbn: "", stock: 100,
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleImageUpload = (url) => {
    setData((prev) => ({ ...prev, url }));
  };

  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const submit = async () => {
    const { url, title, author, price, desc, language } = data;
    if (!url || !title || !author || !price || !desc || !language) {
      toast.error("All required fields must be filled (including Image Upload)");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/add-book", { ...data, genres, price: Number(data.price), stock: Number(data.stock) });
      setData({ url: "", title: "", author: "", price: "", desc: "", language: "", isbn: "", stock: 100 });
      setGenres([]);
      toast.success("Book added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-[100%] p-0 md:p-4 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-400 dark:text-zinc-500 mb-6">Add Book</h1>
      <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 space-y-6">
        
        <ImageUpload 
          label="Book Cover Image *" 
          currentUrl={data.url} 
          onUpload={handleImageUpload} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title *" id="title" name="title" value={data.title} onChange={change} placeholder="Book title" />
          <Field label="Author *" id="author" name="author" value={data.author} onChange={change} placeholder="Author name" />
        </div>

        {/* Language + Price + Stock row */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <Field label="Language *" id="language" name="language" value={data.language} onChange={change} placeholder="e.g. English" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="price" className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">Price (₹) *</label>
            <input
              id="price" type="number" min="0" name="price" required value={data.price} onChange={change}
              placeholder="e.g. 299"
              className="w-full mt-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="stock" className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">Stock</label>
            <input
              id="stock" type="number" min="0" name="stock" value={data.stock} onChange={change}
              className="w-full mt-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* ISBN */}
        <Field label="ISBN (optional)" id="isbn" name="isbn" value={data.isbn} onChange={change} placeholder="e.g. 9780743273565" />

        {/* Description */}
        <div>
          <label htmlFor="desc" className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">Description *</label>
          <textarea
            id="desc" name="desc" rows="4" required value={data.desc} onChange={change}
            placeholder="Book description"
            className="w-full mt-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none text-sm"
          />
        </div>

        {/* Genres */}
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-3">Genres</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-4 py-1.5 rounded-full text-xs border font-medium transition-all ${
                  genres.includes(g)
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <button
          className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Add to Collection"}
        </button>
      </div>
    </motion.div>
  );
};

const Field = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{label}</label>
    <input
      id={id}
      type="text"
      {...props}
      className="w-full mt-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
    />
  </div>
);

export default AddBook;