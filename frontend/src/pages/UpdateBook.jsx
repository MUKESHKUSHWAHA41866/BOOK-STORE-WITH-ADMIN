import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ImageUpload from "../components/ImageUpload/ImageUpload";

const GENRE_OPTIONS = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller",
  "Romance", "Horror", "Biography", "History", "Self-Help", "Business",
  "Technology", "Science", "Children", "Young Adult", "Poetry", "Classics",
];

const UpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    url: "", title: "", author: "", price: "", desc: "", language: "", isbn: "", stock: 100,
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/api/v1/get-book-by-id/${id}`);
        const book = response.data.data;
        setData({
          url: book.url || "",
          title: book.title || "",
          author: book.author || "",
          price: book.price || "",
          desc: book.desc || "",
          language: book.language || "",
          isbn: book.isbn || "",
          stock: book.stock ?? 100,
        });
        setGenres(book.genres || []);
      } catch {
        toast.error("Failed to load book data");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleImageUpload = (imageUrl) => {
    setData({ ...data, url: imageUrl });
  };

  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const submit = async () => {
    const { url, title, author, price, desc, language } = data;
    if (!url || !title || !author || !price || !desc || !language) {
      toast.error("All required fields must be filled");
      return;
    }
    setUpdating(true);
    try {
      await api.put("/api/v1/update-book", 
        { ...data, genres, price: Number(data.price), stock: Number(data.stock) },
        { headers: { bookid: id } }
      );
      toast.success("Book updated successfully!");
      navigate(`/view-book-details/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update book");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-bold">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
        <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 italic transition-colors">Update Edition</h1>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-2xl border border-zinc-100 dark:border-zinc-700 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cover Management */}
          <div className="lg:col-span-4 space-y-4">
            <label className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest">Book Cover</label>
            <ImageUpload 
              onUploadSuccess={handleImageUpload} 
              existingImage={data.url}
            />
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              We recommend 3:4 aspect ratio. Max size 5MB. Changes will reflect immediately on the cover.
            </p>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Title *" id="title" name="title" value={data.title} onChange={change} placeholder="Eloquent JavaScript" />
              <Field label="Author *" id="author" name="author" value={data.author} onChange={change} placeholder="Marijn Haverbeke" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Field label="Language *" id="language" name="language" value={data.language} onChange={change} placeholder="English" />
              <div className="col-span-1">
                <label className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest mb-2 block">Price (₹)</label>
                <input
                  type="number" min="0" name="price" value={data.price} onChange={change}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-2xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-bold"
                />
              </div>
              <div className="col-span-1">
                <label className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest mb-2 block">Stock</label>
                <input
                  type="number" min="0" name="stock" value={data.stock} onChange={change}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-2xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-bold"
                />
              </div>
              <Field label="ISBN" id="isbn" name="isbn" value={data.isbn} onChange={change} placeholder="Optional" />
            </div>

            <div>
              <label className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest mb-2 block">Description *</label>
              <textarea
                name="desc" rows="5" value={data.desc} onChange={change}
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-2xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all resize-none font-medium leading-relaxed"
                placeholder="Briefly describe the masterpiece..."
              />
            </div>

            <div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest mb-4">Genres</p>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      genres.includes(g)
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-blue-500"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-white font-black rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                onClick={submit}
                disabled={updating}
              >
                {updating ? "Saving Changes..." : "Apply Updates"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Field = ({ label, id, ...props }) => (
  <div className="w-full">
    <label htmlFor={id} className="text-zinc-700 dark:text-zinc-300 text-sm font-black uppercase tracking-widest mb-2 block">{label}</label>
    <input
      id={id}
      type="text"
      {...props}
      className="w-full mt-1.5 bg-zinc-900 border border-zinc-700 text-zinc-100 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
    />
  </div>
);

export default UpdateBook;
