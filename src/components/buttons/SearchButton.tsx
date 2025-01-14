import { AirplaneIcon } from "@/components/icons";
import { MouseEvent } from "react";
import styles from "./SearchButton.module.css";

interface SearchButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  scale?: number;
  opacity?: number;
}

export function SearchButton({
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  scale = 1,
  opacity = 1,
}: SearchButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.searchButton} relative mb-5 mt-12 inline-flex scale-100 select-none items-center justify-center rounded-full px-9 py-5 text-base font-medium text-white shadow-[0_0.4rem_1.5rem_-0.3rem] shadow-black/30 transition-all duration-300 ease-pop will-change-transform [transform-style:preserve-3d] hover:scale-[1.04] hover:opacity-90 hover:shadow-[0_0.4rem_1rem_-0.2rem] hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 dark:text-black`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      role="button"
      aria-label={loading ? "Searching for flights" : "Search for flights"}
      style={{
        backgroundColor: "#005C8A",
        opacity,
      }}
    >
      <span className={styles.buttonText}>
        {loading ? "Searching..." : "Gimme Flights"}
      </span>

      <span className={styles.primaryPlane}>
        <AirplaneIcon className="h-5 w-5" />
      </span>

      <span className={styles.secondaryPlane}>
        <AirplaneIcon className="h-5 w-5" />
      </span>
    </button>
  );
}
