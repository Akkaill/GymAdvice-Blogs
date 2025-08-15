import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

export function Section({ children }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen snap-start"
    >
      {children}
    </motion.section>
  );
}
