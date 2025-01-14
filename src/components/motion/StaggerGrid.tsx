import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerGridProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  variant?: "city" | "flight" | "detailed";
}

export function StaggerGrid({
  children,
  className = "",
  itemClassName = "",
  variant = "city",
}: StaggerGridProps) {
  const getContainerVariants = (variant: string) => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: variant === "city" ? 0.04 : 0.01,
        delayChildren: variant === "city" ? 0.02 : 0.01,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        staggerChildren: variant === "city" ? 0.03 : 0.02,
        staggerDirection: -1,
        height: { duration: 0.2, delay: 0.1 },
        opacity: { duration: 0.2 },
      },
    },
  });

  const item = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeInOut",
      },
    },
  };

  const getGridClass = () => {
    switch (variant) {
      case "city":
        return "grid grid-cols-1 gap-2 xsm:gap-4 sm:grid-cols-2 lg:grid-cols-3 ";
      case "flight":
        return "grid grid-cols-2 gap-2 ssm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5";
      case "detailed":
        return "space-y-3 ssm:space-y-5";
      default:
        return "";
    }
  };

  const baseClass = getGridClass();

  return (
    <motion.div
      variants={getContainerVariants(variant)}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`${baseClass} ${className}`}
    >
      <AnimatePresence mode="sync">
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={item}
            className={`${variant === "detailed" ? "block" : "w-full"} ${itemClassName}`}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
