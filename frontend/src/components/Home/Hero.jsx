import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="h-[75vh] flex flex-col md:flex-row items-center justify-center transition-colors duration-300">
      <div className="w-full mb-12 md:mb-0 lg:w-3/6 flex flex-col items-center lg:items-start justify-center">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white text-center lg:text-left leading-tight"
        >
          Discover Your Next <span className="text-blue-600">Great Read</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 text-center lg:text-left max-w-lg"
        >
          Uncover captivating stories, enriching knowledge, and endless
          inspiration in our curated collection of books.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10"
        >
          <Link
            to="/all-books"
            className="bg-blue-600 hover:bg-blue-500 text-white text-lg lg:text-xl font-bold px-10 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all duration-300 transform hover:scale-105"
          >
            Explore Library
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full lg:w-3/6 h-auto lg:h-[100%] flex items-center justify-center"
      >
        <motion.img
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          src="./files.png"
          alt="Books illustration"
          className="max-h-[500px] object-contain drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
};

export default Hero;