import { motion } from 'framer-motion'
import Hero from '../components/Home/Hero'
import RecentlyAdded from '../components/Home/RecentlyAdded'
 
const Home = () => {
  return (
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
  )
}
 
export default Home