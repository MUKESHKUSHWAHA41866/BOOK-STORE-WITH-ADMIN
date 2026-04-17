import React from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { FiUser, FiMail, FiMapPin } from "react-icons/fi";

const SeeUserData = ({ userDivData, showUser, setShowUser }) => {
  return (
    <AnimatePresence>
      {showUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUser(false)}
            className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm"
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl border border-zinc-100 dark:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic transition-colors">Customer Insights</h2>
              </div>
              <button 
                onClick={() => setShowUser(false)}
                className="p-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-xl hover:text-red-500 transition-all active:scale-90"
              >
                <RxCross2 size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-4 border border-zinc-100 dark:border-zinc-700/50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shadow-sm">
                  <FiUser size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Username</p>
                  <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 transition-colors">{userDivData.username}</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-4 border border-zinc-100 dark:border-zinc-700/50 transition-colors">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-sm">
                  <FiMail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Email Channel</p>
                  <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 transition-colors break-all">{userDivData.email}</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl flex items-start gap-4 border border-zinc-100 dark:border-zinc-700/50 transition-colors">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <FiMapPin size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Logistics Address</p>
                  <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors italic">
                    &ldquo;{userDivData.address}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-700/50 flex justify-center">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-600 transition-colors">Enterprise CRM v2.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SeeUserData;