import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiUploadCloud, FiX, FiCheckCircle } from "react-icons/fi";
import api from "../../api";

const ImageUpload = ({ onUpload, currentUrl, label = "Upload Image" }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl || "");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.data.url || res.data.secure_url;
      if (!uploadedUrl) throw new Error("No URL returned from server");
      onUpload(uploadedUrl);
      toast.success("Image uploaded!");
      setFile(null);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Upload failed. Try again.";
      toast.error(msg);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{label}</label>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full md:w-40 h-40 bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden flex items-center justify-center group transition-colors hover:border-blue-500">
          {preview ? (
            <>
              <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(""); onUpload(""); }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-zinc-400">
              <FiUploadCloud size={32} />
              <span className="text-[10px] mt-2">Max 5MB</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {file && !loading && (
          <button
            onClick={upload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-600/20 transition-all self-center"
          >
            Confirm Upload
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-2 self-center text-blue-500 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </div>
        )}

        {!file && preview && preview !== currentUrl && (
          <div className="flex items-center gap-2 self-center text-green-500 text-xs font-semibold">
            <FiCheckCircle size={14} /> Ready!
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
