import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const MobileNav = () => {
  const role = useSelector((state) => state.auth.role);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const MobileLink = ({ to, label }) => (
    <Link
      to={to}
      className={`text-xs font-bold flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all ${isActive(to)
          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
          : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <div className='w-full flex lg:hidden items-center justify-start mt-4 overflow-x-auto gap-3 pb-3 no-scrollbar'>
      {role === "user" && (
        <>
          <MobileLink to="/profile" label="Favourites" />
          <MobileLink to="/profile/orderHistory" label="Orders" />
          <MobileLink to="/profile/settings" label="Settings" />
        </>
      )}
      {role === "admin" && (
        <>
          <MobileLink to="/profile" label="Orders" />
          <MobileLink to="/profile/add-book" label="Add Book" />
          <MobileLink to="/profile/dashboard" label="Analytics" />
          <MobileLink to="/profile/audit" label="Audit" />
          <MobileLink to="/profile/settings" label="Settings" />
        </>
      )}
    </div>
  );
};

export default MobileNav;