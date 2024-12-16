import { useEffect, KeyboardEvent } from "react";

interface UseModalKeyboardProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onEscape?: () => void;
}

export const useModalKeyboard = ({
  isOpen,
  setIsOpen,
  onEscape,
}: UseModalKeyboardProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        if (onEscape) {
          onEscape();
        }
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape as any);
    return () => {
      document.removeEventListener("keydown", handleEscape as any);
    };
  }, [isOpen, setIsOpen, onEscape]);
};
