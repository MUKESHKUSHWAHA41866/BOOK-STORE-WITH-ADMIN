import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";
import Sidebar from "../components/Profile/Sidebar";
import MobileNav from "../components/Profile/MobileNav";
import api from "../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/v1/get-user-information");
        setProfile(response.data);
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="bg-white dark:bg-zinc-900 w-full h-screen flex items-center justify-center transition-colors">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 px-2 md:px-12 flex flex-col md:flex-row py-8 gap-4 text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors">
      <div className="w-full md:w-1/6 h-auto lg:h-screen">
        <Sidebar data={profile} />
        <MobileNav />
      </div>
      <div className="w-full md:w-5/6">
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;