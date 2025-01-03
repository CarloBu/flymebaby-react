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
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [windowWidth, setWindowWidth] = React.useState(0);

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
  };

  const selectedOptions = selectedValues
    .map((code) => options.find((opt) => opt.code === code))
    .filter((opt): opt is Option => opt !== undefined);

  const allItemsOption: Option = {
    code: "ALL",
    name: allOptionText,
  };

  const handleSelection = (code: string) => {
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
  };

  const getDisplayText = (option: Option) => {
    if (displayFormat) {
      return displayFormat(option);
    }
    return showCode ? (
      <span className="flex items-center gap-1">
        <span className="truncate">{option.name}</span>
        <span className="whitespace-nowrap">({option.code})</span>
        {(option.countryCode || option.country) && (
          <span className="ml-2 truncate text-white opacity-100 dark:text-gray-800">
            {option.countryCode || option.country}
          </span>
        )}
      </span>
    ) : (
      option.name
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
        <div className="flex items-center gap-1 rounded-full bg-white/20 py-0 pl-2 pr-2 text-base transition-all dark:bg-black/20 sm:py-1 sm:pl-3 sm:pr-2">
          <span className="max-w-48 truncate">Anywhere in Europe</span>
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

    const visibleValues = selectedOptions.slice(0, MAX_VISIBLE_ITEMS);
    const remainingCount = selectedValues.length - MAX_VISIBLE_ITEMS;
    const remainingOptions = selectedOptions.slice(MAX_VISIBLE_ITEMS);

    return (
      <>
        {visibleValues.map((option) => (
          <div
            key={option.code}
            className="flex items-center gap-1 rounded-full bg-white/20 py-0 pl-2 pr-2 text-base transition-all dark:bg-black/20 sm:py-1 sm:pl-3 sm:pr-2"
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
          <div className="flex items-center gap-1 rounded-full bg-white/20 py-0 pl-2 pr-2 text-base transition-all dark:bg-black/20 sm:py-1 sm:pl-3 sm:pr-2">
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
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "button-animation-subtle flex w-full min-w-40 select-none items-center justify-start gap-2 whitespace-nowrap rounded-full bg-orange-custom px-2 py-5 text-base text-white shadow-orange-shadow transition-all hover:bg-orange-custom hover:text-white hover:shadow-orange-hover-shadow dark:bg-orange-custom dark:text-white dark:hover:bg-orange-custom dark:hover:text-white dark:hover:shadow-orange-hover-shadow sm:px-2 sm:py-6",
            className,
          )}
          aria-label={ariaLabel}
        >
          <div className="flex flex-1 flex-wrap gap-1.5 text-base">
            {renderSelectedValues()}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[21rem] rounded-3xl px-0 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
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
              className="mb-2 rounded-full bg-gray-100/80 py-3 pl-9 pr-4 text-base text-gray-900 transition-all placeholder:text-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
          <CommandList className="mt-1 max-h-40 overflow-y-auto px-1 transition-all scrollbar-thin sm:max-h-80">
            <CommandEmpty className="p-2 text-center text-gray-500 dark:text-gray-400">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  key="all-items"
                  value={allItemsOption.name}
                  onSelect={() => handleSelection("ALL")}
                  className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-selected-color dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                >
                  <span
                    className={
                      selectedValues.includes("ALL") ? "font-medium" : ""
                    }
                  >
                    {allItemsOption.name}
                  </span>
                  {selectedValues.includes("ALL") && (
                    <CheckIcon className="text-gray-800 dark:text-white" />
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
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-selected-color dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <div className="flex-1">
                      <span className="flex items-center gap-1 font-medium">
                        {getDisplayText(option)}
                      </span>
                    </div>
                    <CheckIcon className="-ml-10 flex-shrink-0 text-gray-800 dark:text-white" />
                  </CommandItem>
                ))}

              {/* City Groups */}
              {groupedOptions.map((group) => (
                <React.Fragment key={group.city}>
                  <CommandItem
                    value={`All airports in ${group.city}`}
                    onSelect={() => handleCitySelection(group.airports)}
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base font-medium text-gray-900 transition-all data-[selected=true]:bg-selected-color dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <span>All airports in {group.city}</span>
                    {group.airports.every((airport) =>
                      selectedValues.includes(airport.code),
                    ) && (
                      <CheckIcon className="text-gray-800 dark:text-white" />
                    )}
                  </CommandItem>
                  {group.airports
                    .filter((airport) => !selectedValues.includes(airport.code))
                    .map((airport) => (
                      <CommandItem
                        key={airport.code}
                        value={`${airport.name} ${airport.code} ${airport.country || ""}`}
                        onSelect={() => handleSelection(airport.code)}
                        className="relative ml-4 flex w-[calc(100%-1rem)] items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-selected-color dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                      >
                        <div className="flex-1">
                          <span className="flex items-center gap-1">
                            {getDisplayText(airport)}
                          </span>
                        </div>
                        {selectedValues.includes(airport.code) && (
                          <CheckIcon className="-ml-10 flex-shrink-0 text-gray-800 dark:text-white" />
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
                    className="flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-base text-gray-900 transition-all data-[selected=true]:bg-selected-color dark:text-white dark:hover:bg-gray-700 dark:data-[selected=true]:bg-gray-700"
                  >
                    <div className="flex-1">
                      <span className="flex items-center gap-1">
                        {getDisplayText(option)}
                      </span>
                    </div>
                    {selectedValues.includes(option.code) && (
                      <CheckIcon className="-ml-10 flex-shrink-0 text-gray-800 dark:text-white" />
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
