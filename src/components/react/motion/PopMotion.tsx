import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PopMotionProps {
  children: ReactNode;
  className?: string;
  layout?: boolean | "position" | "size";
  onAnimationComplete?: () => void;
}

export function PopMotion({
  children,
  className = "",
  layout = "position",
  onAnimationComplete,
}: PopMotionProps) {
  return (
    <motion.div
      layout={layout}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
      className={className}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  );
}
