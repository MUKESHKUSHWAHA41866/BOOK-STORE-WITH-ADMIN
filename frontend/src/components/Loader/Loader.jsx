import { motion } from 'framer-motion'

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{
          rotate: 360,
          borderRadius: ["20%", "20%", "50%", "50%", "20%"],
        }}
        transition={{
          duration: 2,
          ease: "linear",
          repeat: Infinity,
        }}
        className="w-12 h-12 bg-blue-600 border-4 border-blue-400/30"
      />
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-zinc-500 font-medium text-sm"
      >
        Loading BookHeaven...
      </motion.p>
    </div>
  )
}

export default Loader