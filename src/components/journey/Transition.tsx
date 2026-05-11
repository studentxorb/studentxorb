import { motion } from "framer-motion";

export function Transition({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.p
        initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-3xl md:text-5xl font-light text-foreground italic"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}