"use client";

import * as React from "react";
import { Check as CheckIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CloseIcon } from "@/components/icons";

interface Option {
  code: string;
  name: string;
  country?: string;
  countryCode?: string;
  city?: string;
}

interface CityGroup {
  city: string;
  airports: Option[];
}

interface MultiComboboxProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  showAllOption?: boolean;
  allOptionText?: string;
  showCode?: boolean;
  displayFormat?: (option: Option) => string;
  ariaLabel?: string;
  mobileBreakpoint?: number;
  label?: string;
}

export function MultiCombobox({
  options,
  selectedValues,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  showAllOption = false,
  allOptionText = "All Items",
  showCode = false,
  displayFormat,
  ariaLabel,
  mobileBreakpoint = 419,
  label,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    // Load initial interaction state from localStorage, using ariaLabel as unique key
    const key = `multiCombobox_${ariaLabel}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : false;
  });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Save interaction state to localStorage whenever it changes
  React.useEffect(() => {
    if (ariaLabel) {
      const key = `multiCombobox_${ariaLabel}`;
      localStorage.setItem(key, JSON.stringify(hasInteracted));
    }
  }, [hasInteracted, ariaLabel]);

  React.useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Add resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add effect to handle mobile scroll behavior
  React.useEffect(() => {
    if (open && windowWidth <= 768 && buttonRef.current) {
      setTimeout(() => {
        const yOffset = -80; // Add some padding at the top
        const element = buttonRef.current;
        if (element) {
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [open, windowWidth]);

  const filterOptions = React.useMemo(() => {
    return options.filter((option) => {
      const searchCountry =
        option.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.countryCode?.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchCountry
      );
    });
  }, [options, searchQuery]);

  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: Option[] } = {};

    filterOptions.forEach((option) => {
      if (option.city) {
        if (!groups[option.city]) {
          groups[option.city] = [];
        }
        groups[option.city].push(option);
      }
    });

    return Object.entries(groups)
      .filter(([_, airports]) => airports.length > 1)
      .map(([city, airports]) => ({
        city,
        airports,
      }));
  }, [filterOptions]);

  const handleCitySelection = (cityAirports: Option[]) => {
    if (!hasInteracted) setHasInteracted(true);
    const cityAirportCodes = cityAirports.map((airport) => airport.code);
    const allCityAirportsSelected = cityAirportCodes.every((code) =>
      selectedValues.includes(code),
    );

    if (allCityAirportsSelected) {
      onChange(
        selectedValues.filter((code) => !cityAirportCodes.includes(code)),
      );
    } else {
      const newSelection = [
        ...new Set([...selectedValues, ...cityAirportCodes]),
      ];
      onChange(newSelection);
    }
    setOpen(false);
  };

  const selectedOptions = selectedValues
    .map((code) => options.find((opt) => opt.code === code))
    .filter((opt): opt is Option => opt !== undefined);

  const allItemsOption: Option = {
    code: "ALL",
    name: allOptionText,
  };

  const handleSelection = (code: string) => {
    if (!hasInteracted) setHasInteracted(true);
    if (code === "ALL") {
      if (selectedValues.length === options.length) {
        onChange([]);
      } else {
        onChange([...options.map((opt) => opt.code)]);
      }
    } else {
      onChange(
        selectedValues.includes(code)
          ? selectedValues.filter((v) => v !== code)
          : [...selectedValues, code],
      );
    }
    setOpen(false);
  };

  const getDisplayText = (option: Option) => {
    if (displayFormat) {
      return displayFormat(option);
    }
    return showCode ? (
      <span className="flex items-center gap-1">
        <span className="truncate">{option.city || option.name}</span>
        <span className="whitespace-nowrap">({option.code})</span>
      </span>
    ) : (
      option.city || option.name
    );
  };

  const getModalDisplayText = (option: Option, isSelected: boolean = false) => {
    return (
      <div
        className={`flex w-full items-center justify-between ${isSelected ? "pr-10" : "pr-0"}`}
      >
        <span className="flex items-center gap-1">
          <span className="truncate">{option.city || option.name}</span>
          <span className="whitespace-nowrap">({option.code})</span>
        </span>
        {(option.country || option.countryCode) && (
          <span className="ml-2 truncate font-light text-gray-400 dark:text-gray-400">
            {option.country || option.countryCode}
          </span>
        )}
      </div>
    );
  };

  const renderSelectedValues = () => {
    const MAX_VISIBLE_ITEMS = windowWidth > mobileBreakpoint ? 2 : 1;

    if (selectedValues.length === 0) {
      return (
        <span className="ml-4 text-base text-white/90 dark:text-white/90">
          {placeholder}
        </span>
      );
    }

    if (selectedValues.length === options.length) {
      return (
        <div className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-3 pr-2 text-base transition-all dark:bg-black/20">
          <span className="max-w-48 truncate">All listed countries</span>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange([]);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange([]);
              }
            }}
            aria-label="Remove all"
            className="rounded-full p-[2px] transition-all hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <CloseIcon className="scale-75" />
          </div>
        </div>
      );
    }

    if (selectedValues.length === 1) {
      const selectedOption = selectedOptions[0];
      return (
        <div className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-3 pr-2 text-base transition-all dark:bg-black/20">
          <span className="max-w-48 truncate sm:max-w-[200px]">
            {getDisplayText(selectedOption)}
          </span>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange([]);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange([]);
              }
            }}
            aria-label="Remove"
            className="rounded-full p-[2px] transition-all hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <CloseIcon className="scale-75" />
          </div>
        </div>
      );
    }

    if (selectedValues.length === 2 && !selectedOptions[0].city) {
      // Show full names for exactly 2 countries
      return (
        <>
          {selectedOptions.map((option) => (
            <div
              key={option.code}
              className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-3 pr-2 text-base transition-all dark:bg-black/20"
            >
              <span className="max-w-48 truncate sm:max-w-[200px]">
                {getDisplayText(option)}
              </span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(selectedValues.filter((v) => v !== option.code));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(selectedValues.filter((v) => v !== option.code));
                  }
                }}
                aria-label="Remove"
                className="rounded-full p-[2px] transition-all hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <CloseIcon className="scale-75" />
              </div>
            </div>
          ))}
        </>
      );
    }

    const visibleValues = selectedOptions.slice(0, MAX_VISIBLE_ITEMS);
    const remainingCount = selectedValues.length - MAX_VISIBLE_ITEMS;
    const remainingOptions = selectedOptions.slice(MAX_VISIBLE_ITEMS);

    return (
      <>
        {visibleValues.map((option) => (
          <div
            key={option.code}
            className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-3 pr-2 text-base transition-all dark:bg-black/20"
          >
            <span className="max-w-20 truncate sm:max-w-48">{option.code}</span>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(selectedValues.filter((v) => v !== option.code));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(selectedValues.filter((v) => v !== option.code));
                }
              }}
              aria-label="Remove"
              className="rounded-full p-[2px] transition-all hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <CloseIcon className="scale-75" />
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-3 pr-2 text-base transition-all dark:bg-black/20">
            <span>+{remainingCount} more</span>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(
                  selectedValues.filter(
                    (v) => !remainingOptions.map((opt) => opt.code).includes(v),
                  ),
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(
                    selectedValues.filter(
                      (v) =>
                        !remainingOptions.map((opt) => opt.code).includes(v),
                    ),
                  );
                }
              }}
              className="rounded-full p-[2px] transition-all hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <CloseIcon className="scale-75" />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "button-animation-subtle flex w-full select-none items-center justify-start gap-2 whitespace-nowrap rounded-full border-0 bg-bubble-color px-2 py-6 text-base text-white shadow-bubble-shadow transition-all hover:bg-bubble-color-hover hover:text-white hover:shadow-bubble-hover-shadow dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover dark:hover:text-white dark:hover:shadow-bubble-hover-shadow",
            selectedValues.length > 0 ? "min-w-[5rem]" : "min-w-[11rem]",
            selectedValues.length === 0 &&
              "bg-bubble-color-select hover:bg-bubble-color-select",
            hasInteracted && selectedValues.length === 0
              ? "!bg-bubble-color-attention"
              : "",
            className,
          )}
          aria-label={ariaLabel}
        >
          <div className="ml-5 flex flex-1 flex-wrap items-center gap-1.5 text-base">
            {label && (
              <span className="mr-1 font-medium text-white/90 dark:text-white/90">
                {label}
              </span>
            )}
            {renderSelectedValues()}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "rounded-3xl px-0 py-2 shadow-lg",
          options.some((opt) => opt.city) ? "w-[23.3rem]" : "w-[21rem]",
        )}
        align="center"
        sideOffset={4}
      >
        <Command className="rounded-3xl [--cmd-accent:0_0%_95%] dark:bg-gray-800">
          <div className="relative">
            <Search className="absolute left-6 top-[29%] h-4 w-4 text-gray-500 dark:text-gray-400" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="mb-2 rounded-full bg-gray-200/50 py-3 pl-9 pr-4 text-base text-gray-900 transition-all placeholder:text-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
          <CommandList className="mt-1 max-h-48 overflow-y-auto px-1 transition-all scrollbar-thin sm:max-h-80">
            <CommandEmpty className="p-2 text-center text-gray-500 dark:text-gray-400">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  key="all-items"
                  value={allItemsOption.name}
                  onSelect={() => handleSelection("ALL")}
                  className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-gray-200/70 dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                >
                  <span
                    className={
                      selectedValues.includes("ALL") ? "font-medium" : ""
                    }
                  >
                    {allItemsOption.name}
                  </span>
                  {selectedValues.includes("ALL") && (
                    <CheckIcon className="text-gray-600 dark:text-gray-200" />
                  )}
                </CommandItem>
              )}

              {/* Selected Items */}
              {filterOptions
                .filter((opt) => selectedValues.includes(opt.code))
                .map((option) => (
                  <CommandItem
                    key={option.code}
                    value={`${option.name} ${option.code} ${option.country || ""}`}
                    onSelect={() => handleSelection(option.code)}
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-gray-200/70 dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <div className="flex-1">
                      <span className="flex items-center gap-1 font-medium">
                        {getModalDisplayText(option, true)}
                      </span>
                    </div>
                    <CheckIcon className="-ml-10 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  </CommandItem>
                ))}

              {/* City Groups */}
              {groupedOptions.map((group) => (
                <React.Fragment key={group.city}>
                  <CommandItem
                    value={`All airports in ${group.city}`}
                    onSelect={() => handleCitySelection(group.airports)}
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base font-medium text-gray-900 transition-all data-[selected=true]:bg-gray-200/70 dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <span>All airports in {group.city}</span>
                    {group.airports.every((airport) =>
                      selectedValues.includes(airport.code),
                    ) && (
                      <CheckIcon className="text-gray-500 dark:text-gray-400" />
                    )}
                  </CommandItem>
                  {group.airports
                    .filter((airport) => !selectedValues.includes(airport.code))
                    .map((airport) => (
                      <CommandItem
                        key={airport.code}
                        value={`${airport.name} ${airport.code} ${airport.country || ""}`}
                        onSelect={() => handleSelection(airport.code)}
                        className="relative ml-4 flex w-[calc(100%-1rem)] items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-gray-200/70 dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                      >
                        <div className="flex-1">
                          <span className="flex items-center gap-1">
                            {getModalDisplayText(airport)}
                          </span>
                        </div>
                        {selectedValues.includes(airport.code) && (
                          <CheckIcon className="-ml-10 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                        )}
                      </CommandItem>
                    ))}
                </React.Fragment>
              ))}

              {/* Remaining Items */}
              {filterOptions
                .filter(
                  (opt) =>
                    !selectedValues.includes(opt.code) &&
                    !groupedOptions.some((group) =>
                      group.airports.some(
                        (airport) => airport.code === opt.code,
                      ),
                    ),
                )
                .map((option) => (
                  <CommandItem
                    key={option.code}
                    value={`${option.name} ${option.code} ${option.country || ""}`}
                    onSelect={() => handleSelection(option.code)}
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-gray-200/70 dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <div className="flex-1">
                      <span className="flex items-center gap-1">
                        {getModalDisplayText(option)}
                      </span>
                    </div>
                    {selectedValues.includes(option.code) && (
                      <CheckIcon className="-ml-10 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
