import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { FiBarChart2, FiBookOpen, FiHeart, FiClock, FiSettings, FiShoppingBag, FiActivity, FiTag } from "react-icons/fi";
import { authActions } from '../../store/auth';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api';

const Sidebar = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);

  const logout = async () => {
    try {
      await api.post("/api/v1/logout");
      dispatch(authActions.logout());
      dispatch(authActions.changeRole("user"));
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error(error);
      localStorage.clear();
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
        isActive(to)
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <div className='bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-between h-auto lg:h-[100%] gap-6 border border-zinc-100 dark:border-zinc-700 transition-colors shadow-xl'>
      {/* Avatar + Name */}
      <div className='flex items-center flex-col justify-center w-full'>
        <div className="relative group">
          <img
            src={data.avatar || "https://res.cloudinary.com/dv5p6v6ky/image/upload/v1713214567/avatars/default.png"}
            alt={data.username}
            className='h-20 w-20 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-md group-hover:scale-105 transition-transform'
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-lg"></div>
        </div>
        <p className='mt-4 text-lg text-zinc-900 dark:text-zinc-100 font-black tracking-tight'>{data.username}</p>
        <p className='text-xs text-zinc-500 dark:text-zinc-400 font-medium'>{data.email}</p>
        <span className={`mt-3 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border font-black ${
          role === "admin"
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/50"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/50"
        }`}>
          {role === "admin" ? "Administrator" : "Member"}
        </span>
        <div className='w-full mt-6 h-px bg-zinc-200 dark:bg-zinc-700 hidden lg:block' />
      </div>

      {/* Navigation Links */}
      <div className='w-full flex-col gap-2 hidden lg:flex flex-1'>
        {role === "user" && (
          <>
            <NavLink to="/profile" icon={FiHeart} label="My Favourites" />
            <NavLink to="/profile/orderHistory" icon={FiClock} label="Order History" />
            <NavLink to="/profile/settings" icon={FiSettings} label="Settings" />
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink to="/profile" icon={FiShoppingBag} label="All Orders" />
            <NavLink to="/profile/add-book" icon={FiBookOpen} label="Add Book" />
            <NavLink to="/profile/dashboard" icon={FiBarChart2} label="Analytics" />
            <NavLink to="/profile/coupons" icon={FiTag} label="Coupons" />
            <NavLink to="/profile/audit" icon={FiActivity} label="Audit Logs" />
            <NavLink to="/profile/settings" icon={FiSettings} label="Settings" />
          </>
        )}
      </div>

      {/* Logout */}
      <button
        className='w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black flex items-center justify-center py-3 rounded-2xl hover:bg-red-600 hover:text-white border border-red-100 dark:border-red-900/50 transition-all duration-300 text-sm gap-2 shadow-sm'
        onClick={logout}
      >
        Sign Out <FaArrowRightFromBracket size={14} />
      </button>
    </div>
  );
};

export default Sidebar;