import React, { useState, useRef, useEffect } from "react";
import { CheckIcon, CloseIcon } from "../../icons";
import { useModalKeyboard } from "../../../hooks/useModalKeyboard";

interface Option {
  code: string;
  name: string;
  country?: string;
}

interface ComboboxModalProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  displayFormat?: (option: Option) => string;
  searchFields?: (option: Option) => string[];
  minWidth?: string;
  showSelectAll?: boolean;
  selectAllLabel?: string;
}

const MAX_VISIBLE_ITEMS = 2;

export const CustomComboboxModal = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  displayFormat = (option) =>
    option.country ? `${option.name} (${option.code})` : option.name,
  searchFields = (option) => [option.name, option.code],
  minWidth = "10rem",
  showSelectAll = false,
  selectAllLabel = "All Options",
}: ComboboxModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useModalKeyboard({ isOpen, setIsOpen });

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  // Reset highlighted index when search query changes or modal closes
  useEffect(() => {
    setHighlightedIndex(!searchQuery && showSelectAll ? 0 : -1);
  }, [searchQuery, isOpen, showSelectAll]);

  // Add this new effect to handle scrolling
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const listElement = listRef.current;
      const highlightedElement = listElement.children[
        highlightedIndex
      ] as HTMLElement;

      if (highlightedElement) {
        const listRect = listElement.getBoundingClientRect();
        const highlightedRect = highlightedElement.getBoundingClientRect();

        // Check if the highlighted item is outside the visible area
        if (highlightedRect.bottom > listRect.bottom) {
          // Scroll down if item is below viewport
          listElement.scrollTop += highlightedRect.bottom - listRect.bottom;
        } else if (highlightedRect.top < listRect.top) {
          // Scroll up if item is above viewport
          listElement.scrollTop -= listRect.top - highlightedRect.top;
        }
      }
    }
  }, [highlightedIndex]);

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100) as number;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!isTouchDevice) return;
    setIsOpen(!isOpen);
  };

  const toggleOption = (
    e: React.MouseEvent | React.KeyboardEvent,
    code: string,
  ) => {
    e.preventDefault(); // Prevent form submission
    const newSelected = selectedValues.includes(code)
      ? selectedValues.filter((v) => v !== code)
      : [...selectedValues, code];
    onChange(newSelected);
  };

  const removeOption = (
    e: React.MouseEvent | React.KeyboardEvent,
    code: string,
  ) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== code));
  };

  const filteredOptions = options.filter((option) =>
    searchFields(option).some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ": // Space key
        e.preventDefault();
        setIsOpen(true);
        // Focus the search input when opening with keyboard
        setTimeout(() => {
          const searchInput =
            modalRef.current?.querySelector('input[type="text"]');
          if (searchInput) {
            (searchInput as HTMLInputElement).focus();
          }
        }, 0);
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;

      case "Tab":
        if (isOpen) {
          e.preventDefault();
          const searchInput =
            modalRef.current?.querySelector('input[type="text"]');
          if (searchInput) {
            (searchInput as HTMLInputElement).focus();
          }
        }
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hasSelectAllButton = showSelectAll && !searchQuery;
    const totalOptions = hasSelectAllButton
      ? filteredOptions.length + 1
      : filteredOptions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex === 0 && hasSelectAllButton) {
          // Handle "Select All" option
          const allCodes = options.map((opt) => opt.code);
          onChange(selectedValues.length === options.length ? [] : allCodes);
        } else if (filteredOptions.length > 0) {
          const actualIndex = hasSelectAllButton
            ? highlightedIndex - 1
            : highlightedIndex;
          if (actualIndex >= 0 && actualIndex < filteredOptions.length) {
            const selectedOption = filteredOptions[actualIndex];
            toggleOption(e, selectedOption.code);
          }
        }
        // Keep focus in the input after selection
        e.currentTarget.focus();
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        // Return focus to trigger button
        const triggerButton = modalRef.current?.querySelector("button");
        if (triggerButton) {
          triggerButton.focus();
        }
        break;

      case "Tab":
        if (!e.shiftKey && highlightedIndex === filteredOptions.length - 1) {
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    const allCodes = options.map((opt) => opt.code);
    onChange(selectedValues.length === options.length ? [] : allCodes);
  };

  const renderSelectedValues = () => {
    if (selectedValues.length === 0) {
      return <span className="ml-4 text-white/90">{placeholder}</span>;
    }

    const visibleValues = selectedValues.slice(0, MAX_VISIBLE_ITEMS);
    const remainingCount = selectedValues.length - MAX_VISIBLE_ITEMS;

    return (
      <>
        {visibleValues.map((code) => {
          const option = options.find((opt) => opt.code === code);
          return (
            <span
              key={code}
              className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0 transition-all"
            >
              {option ? option.code : code}
              <button
                onClick={(e) => removeOption(e, code)}
                className="rounded-full p-1 transition-all hover:bg-gray-800 hover:text-white"
              >
                <CloseIcon />
              </button>
            </span>
          );
        })}
        {remainingCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0 transition-all">
            +{remainingCount} more
          </span>
        )}
      </>
    );
  };

  return (
    <div
      className="relative inline-block"
      ref={modalRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="options-listbox"
        className="flex items-center gap-2 rounded-full bg-orange-custom px-2 py-2 text-white shadow-orange-shadow transition-all hover:bg-opacity-90"
        style={{ minWidth }}
      >
        <div className="flex flex-wrap gap-1">{renderSelectedValues()}</div>
      </button>

      {/* Dropdown - Updated positioning */}
      <div
        className={`absolute left-1/2 top-[calc(100%+8px)] z-50 w-[300px] -translate-x-1/2 select-none rounded-3xl bg-white p-2 shadow-lg transition-all duration-200 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-label={`Select ${placeholder}`}
      >
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search options"
            className="f w-full rounded-full bg-gray-100/80 px-4 py-3 text-lg text-gray-900 transition-all placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div
          ref={listRef}
          role="listbox"
          id="options-listbox"
          aria-multiselectable="true"
          className="max-h-[280px] overflow-y-auto transition-all scrollbar-thin"
        >
          {showSelectAll && !searchQuery && (
            <button
              onClick={handleSelectAll}
              className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-gray-900 transition-all ${
                highlightedIndex === 0 ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
              onMouseEnter={() => setHighlightedIndex(0)}
              onMouseLeave={() => setHighlightedIndex(-1)}
            >
              <span className="font-medium">{selectAllLabel}</span>
              {selectedValues.length === options.length && (
                <CheckIcon className="text-gray-800" />
              )}
            </button>
          )}
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.code}
                onClick={(e) => toggleOption(e, option.code)}
                className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-gray-900 transition-all ${
                  index ===
                  (showSelectAll && !searchQuery
                    ? highlightedIndex - 1
                    : highlightedIndex)
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                }`}
                onMouseEnter={() =>
                  setHighlightedIndex(
                    showSelectAll && !searchQuery ? index + 1 : index,
                  )
                }
                onMouseLeave={() => setHighlightedIndex(-1)}
              >
                <span>{displayFormat(option)}</span>
                {selectedValues.includes(option.code) && (
                  <CheckIcon className="text-gray-800" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
