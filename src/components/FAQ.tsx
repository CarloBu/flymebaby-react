import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQData {
  data: FAQItem[];
}

function FAQItem({
  question,
  answer,
  isExpanded,
  onExpand,
}: {
  question: string;
  answer: string;
  isExpanded: boolean;
  onExpand: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = isExpanded || isHovered;

  const transitionStyle = {
    transition:
      "transform 0.4s cubic-bezier(0.04, 0.62, 0.23, 0.98), box-shadow 0.4s cubic-bezier(0.04, 0.62, 0.23, 0.98), background 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <motion.div
      className={`faq-item group relative rounded-[2rem] backdrop-blur-xl ${
        isActive
          ? "bg-white/80 dark:bg-gray-800/80"
          : "bg-gray-200/50 dark:bg-gray-800/50"
      }`}
      initial={false}
      animate={isExpanded ? "open" : "closed"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...transitionStyle,
        transform: isActive ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isActive ? "0 8px 20px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      <motion.button
        className="faq-question flex w-full items-center justify-between rounded-[2rem] px-8 py-4 text-left md:px-11 md:py-6"
        onClick={onExpand}
        aria-expanded={isExpanded}
      >
        <span className="text-lg font-medium">{question}</span>
        <motion.span
          variants={{
            open: { rotate: 180, scale: 1.1 },
            closed: { rotate: 0, scale: 1 },
          }}
          transition={{
            duration: 0.4,
            ease: [0.04, 0.62, 0.23, 0.98],
          }}
          className="flex items-center justify-center"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {
                opacity: 1,
                height: "auto",
                transition: {
                  height: {
                    duration: 0.4,
                    ease: [0.04, 0.62, 0.23, 0.98],
                  },
                  opacity: { duration: 0.35, delay: 0.1 },
                },
              },
              collapsed: {
                opacity: 0,
                height: 0,
                transition: {
                  height: {
                    duration: 0.4,
                    ease: [0.04, 0.62, 0.23, 0.98],
                  },
                  opacity: { duration: 0.3 },
                },
              },
            }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">
              <motion.p
                variants={{
                  collapsed: { opacity: 0, y: 10 },
                  open: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                  delay: 0.1,
                }}
                className="px-2 text-black/80 dark:text-white/80 md:px-5 lg:text-[1.075rem]"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ({ animated = false }: { animated?: boolean }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/faq.json")
      .then((res) => res.json())
      .then((data) => {
        setFaqs((data as FAQData).data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading FAQs:", error);
        setIsLoading(false);
      });
  }, []);

  const content = (
    <div className="relative min-h-[82rem] w-full pb-5">
      {!isLoading && (
        <>
          <div className="absolute inset-0 -z-10 bg-[url('/FAQ-background.webp')] bg-cover bg-right bg-no-repeat dark:bg-[url('/FAQ-background-dark.webp')]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/10 via-[20rem] to-transparent dark:from-gray-900/10 dark:via-gray-900/10 dark:via-[50%] dark:to-gray-900" />

          <div className="mx-auto max-w-2xl px-4 pb-16 pt-5 sm:pt-16 lg:max-w-5xl">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 ml-4 text-left text-2xl font-bold sm:mb-10 sm:text-center sm:text-3xl"
            >
              <span className="block sm:inline">Frequently </span>
              <span className="block sm:inline">Asked Questions</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6"
            >
              {faqs.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isExpanded={index === expandedIndex}
                  onExpand={() =>
                    setExpandedIndex(index === expandedIndex ? null : index)
                  }
                />
              ))}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        layout="position"
        className="mt-16"
        transition={{
          duration: 0.4,
          ease: [0.04, 0.62, 0.23, 0.98],
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
