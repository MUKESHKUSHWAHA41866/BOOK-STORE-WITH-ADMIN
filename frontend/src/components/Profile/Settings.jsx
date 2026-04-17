import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import api from "../../api";
import ImageUpload from "../ImageUpload/ImageUpload";
import { motion } from "framer-motion";

const Settings = () => {
  const [address, setAddress] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/v1/get-user-information");
        setProfileData(response.data);
        setAddress(response.data.address || "");
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const submitAddress = async () => {
    if (!address.trim()) {
      toast.error("Address cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const response = await api.put("/api/v1/update-address", { address });
      toast.success(response.data.message || "Address updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (url) => {
    try {
      await api.put("/api/v1/update-avatar", { avatar: url });
      setProfileData((prev) => ({ ...prev, avatar: url }));
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to update profile picture");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[100%] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-[100%] p-0 md:p-4 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
    >
      <h1 className="text-3xl md:text-5xl font-bold text-zinc-400 dark:text-zinc-500 mb-8">
        Settings
      </h1>

      <div className="p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-700 space-y-8">
        {/* Profile Picture Section */}
        <section>
          <ImageUpload 
            label="Profile Picture" 
            currentUrl={profileData?.avatar} 
            onUpload={handleAvatarUpload} 
          />
        </section>

        {/* Account Info (read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">Username</p>
            <div className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {profileData?.username}
            </div>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">Email Address</p>
            <div className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {profileData?.email}
            </div>
          </div>
        </div>

        {/* Editable Address */}
        <div className="flex flex-col">
          <label htmlFor="address" className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">
            Delivery Address
          </label>
          <textarea
            id="address"
            className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-medium text-zinc-900 dark:text-zinc-100 outline-none resize-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all"
            rows="4"
            placeholder="Enter your full delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="mt-6 flex justify-end">
            <button
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              onClick={submitAddress}
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Update Details"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;