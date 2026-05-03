import { motion } from 'framer-motion'
import Hero from '../components/Home/Hero'
import RecentlyAdded from '../components/Home/RecentlyAdded'
 
import { Helmet } from 'react-helmet-async'
 
const Home = () => {
  return (
    <>
      <Helmet>
        <title>BookHeaven | Online Book Store & Admin Panel</title>
        <meta name="description" content="Discover your next favorite read at BookHeaven. Browse a vast collection of books, manage your favorites, and enjoy seamless checkout." />
        <meta name="keywords" content="books, online bookstore, reading, novels, education, admin panel" />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className='bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-10 py-8 transition-colors duration-300'
      >
         <Hero />
         <RecentlyAdded />
      </motion.div>
    </>
  )
}
 
export default Home