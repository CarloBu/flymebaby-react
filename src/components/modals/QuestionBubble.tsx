import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionBubbleProps {
  question: string;
  isAnswered: boolean;
  className?: string;
}

const Particle = ({ color }: { color: string }) => {
  const randomRotate = Math.random() * 360;
  const randomScale = 0.8 + Math.random() * 0.1;
  const randomX = (Math.random() - 0.5) * 60;
  const randomY = (Math.random() - 0.5) * 60;
  const randomDelay = Math.random() * 0.01;

  return (
    <motion.div
      initial={{
        scale: 0,
        rotate: 0,
        x: "-50%",
        y: "-50%",
        opacity: 1,
      }}
      animate={{
        scale: [0, randomScale, 0],
        rotate: [0, randomRotate],
        x: ["-50%", `calc(-50% + ${randomX}px)`],
        y: ["-50%", `calc(-50% + ${randomY}px)`],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.7,
        ease: [0.23, 0.83, 0.67, 0.97],
        delay: randomDelay,
        times: [0, 0.6, 1],
      }}
      style={{
        position: "absolute",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: color,
        zIndex: 50,
        left: "50%",
        top: "50%",
      }}
    />
  );
};

const Confetti = () => {
  const colors = [
    "#bfdbfe", // lighter blue
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {Array.from({ length: 12 }).map((_, i) => (
        <Particle key={i} color={colors[i % colors.length]} />
      ))}
    </div>
  );
};

export const QuestionBubble = ({
  question,
  isAnswered,
  className,
}: QuestionBubbleProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isAnswered) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isAnswered]);

  return (
    <motion.div
      initial={false}
      animate={{
        paddingLeft: isAnswered ? "1.45rem" : "2.5rem",
        paddingRight: isAnswered ? "0.5rem" : "1rem",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
      className={cn(
        "bg-bubble-question-color dark:bg-bubble-question-color-dark mr-5 flex items-center gap-2 rounded-3xl py-2 pl-7 text-base",
        className,
      )}
    >
      <span>{question}</span>
      <div className="relative flex h-8 items-center justify-end">
        <motion.div
          initial={false}
          animate={{
            width: isAnswered ? "2.25rem" : "0.7rem",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
          className="relative flex h-full items-center justify-center overflow-visible"
        >
          <motion.div
            initial={false}
            animate={{
              scale: isAnswered ? 1 : 0,
              opacity: isAnswered ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
              mass: 1,
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <motion.div
              initial={false}
              animate={{
                scale: isAnswered ? [0, 1] : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 10,
                mass: 1,
              }}
            >
              <Check
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-label="Question answered"
              />
            </motion.div>
            <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
