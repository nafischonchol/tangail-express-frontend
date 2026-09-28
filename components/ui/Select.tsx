import { cn } from "@/components/ui/Card";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  closeOnSelect?: boolean;
  variant?: "auto" | "light" | "dark";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, defaultValue, onChange, placeholder, disabled, closeOnSelect = true, variant = "auto", ...props }, ref) => {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isLight = variant === "light" || (variant === "auto" && isAdmin);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLSelectElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Resolve the ref to be used internally
    const combinedRef = (ref || internalRef) as React.MutableRefObject<HTMLSelectElement | null>;

    // Sync selected value state
    const [selectedValue, setSelectedValue] = useState<string | number | readonly string[] | undefined>(
      value ?? defaultValue ?? ""
    );

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    // Parse options from children
    const options = useMemo(() => {
      const parsedOptions: { value: string; label: string; disabled?: boolean }[] = [];

      const extractOptions = (nodes: React.ReactNode) => {
        React.Children.forEach(nodes, (child) => {
          if (!React.isValidElement(child)) return;
          const element = child as React.ReactElement<any>;

          if (element.type === "option") {
            const val = element.props.value !== undefined ? String(element.props.value) : "";
            // Safely extract text content from children
            const getLabel = (node: React.ReactNode): string => {
              if (node === null || node === undefined) return "";
              if (typeof node === "string" || typeof node === "number") return String(node);
              if (Array.isArray(node)) return node.map(getLabel).join("");
              if (React.isValidElement(node)) {
                return getLabel((node as React.ReactElement<any>).props.children);
              }
              return "";
            };
            parsedOptions.push({
              value: val,
              label: getLabel(element.props.children) || val,
              disabled: element.props.disabled,
            });
          } else if (element.type === React.Fragment || element.props.children) {
            extractOptions(element.props.children);
          }
        });
      };

      extractOptions(children);
      return parsedOptions;
    }, [children]);

    // Find the currently selected option
    const selectedOption = useMemo(() => {
      return options.find((opt) => String(opt.value) === String(selectedValue));
    }, [options, selectedValue]);

    // Label shown in the closed trigger button
    const displayLabel = selectedOption ? selectedOption.label : (options[0]?.label || "Select...");

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return options;
      return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    // Reset focused index when query changes
    useEffect(() => {
      setFocusedIndex(-1);
    }, [searchQuery]);

    // Scroll active item into view when keyboard-navigating
    useEffect(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const listEl = listRef.current;
        const activeEl = listEl.children[focusedIndex] as HTMLElement;
        if (activeEl) {
          const listHeight = listEl.clientHeight;
          const activeTop = activeEl.offsetTop;
          const activeHeight = activeEl.clientHeight;

          if (activeTop < listEl.scrollTop) {
            listEl.scrollTop = activeTop;
          } else if (activeTop + activeHeight > listEl.scrollTop + listHeight) {
            listEl.scrollTop = activeTop + activeHeight - listHeight;
          }
        }
      }
    }, [focusedIndex]);

    const updateCoords = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    useEffect(() => {
      if (isOpen) {
        updateCoords();
        window.addEventListener("resize", updateCoords);
        window.addEventListener("scroll", updateCoords, true);
      }
      return () => {
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", updateCoords, true);
      };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const clickedInsideContainer = containerRef.current && containerRef.current.contains(target);
        const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

        if (!clickedInsideContainer && !clickedInsideDropdown) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Reset search when opening/closing
    useEffect(() => {
      if (!isOpen) {
        setSearchQuery("");
      }
    }, [isOpen]);

    const handleSelectOption = (optVal: string) => {
      setSelectedValue(optVal);
      if (closeOnSelect) {
        setIsOpen(false);
      }

      const selectEl = combinedRef.current;
      if (selectEl) {
        // Set the value of the hidden native select element
        const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
          HTMLSelectElement.prototype,
          "value"
        )?.set;
        if (nativeSelectValueSetter) {
          nativeSelectValueSetter.call(selectEl, optVal);
        } else {
          selectEl.value = optVal;
        }

        // Dispatch synthetic change event so React detects it
        const event = new Event("change", { bubbles: true });
        selectEl.dispatchEvent(event);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === "Escape" || (e.key === "Tab" && !e.shiftKey)) {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const targetOpt = filteredOptions[focusedIndex];
          if (!targetOpt.disabled) {
            handleSelectOption(targetOpt.value);
          }
        } else if (filteredOptions.length === 1) {
          if (!filteredOptions[0].disabled) {
            handleSelectOption(filteredOptions[0].value);
          }
        }
      }
    };


    return (
      <div 
        ref={containerRef} 
        className={cn("relative w-full", disabled && "cursor-not-allowed opacity-50")}
        onKeyDown={handleKeyDown}
      >
        {/* Hidden Native Select for Browser & Form Integration */}
        <select
          ref={combinedRef}
          value={selectedValue}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        >
          {children}
        </select>

        {/* Custom Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            isLight
              ? "flex w-full items-center justify-between px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-none focus:border-indigo-500 text-left select-none cursor-pointer h-full min-h-[38px]"
              : "flex w-full items-center justify-between px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-none focus:border-rose-500 text-left select-none cursor-pointer h-full min-h-[38px]",
            className
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-200 ml-2", isLight ? "text-slate-400" : "text-slate-400 dark:text-slate-500", isOpen && "transform rotate-180")} />
        </button>

        {/* Dropdown Options */}
        {isOpen && mounted && coords && createPortal(
          <div 
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${coords.top + 6}px`,
              left: `${coords.left}px`,
              minWidth: `${Math.max(coords.width, 220)}px`,
              zIndex: 9999,
            }}
            className={cn(
              "rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150",
              isLight
                ? "bg-white border border-slate-200"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            )}
          >
            {/* Search Input Box */}
            <div className={cn("flex items-center border-b px-3 py-2", isLight ? "border-slate-100 bg-slate-50/50" : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50")}>
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full bg-transparent text-sm focus:outline-none py-0.5", isLight ? "text-slate-800 placeholder-slate-400" : "text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500")}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={cn("p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors", isLight ? "hover:bg-slate-200" : "hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-200")}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div 
              ref={listRef}
              className={cn("max-h-60 overflow-y-auto py-1 scrollbar-thin", isLight ? "scrollbar-thumb-slate-200" : "scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800")}
            >
              {filteredOptions.length === 0 ? (
                <div className={cn("px-4 py-3 text-xs text-center font-medium", isLight ? "text-slate-400" : "text-slate-400 dark:text-slate-500")}>
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isOptionSelected = String(opt.value) === String(selectedValue);
                  const isFocused = idx === focusedIndex;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                        isLight
                          ? (isOptionSelected 
                              ? "bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-100/80" 
                              : isFocused
                                ? "bg-slate-50 text-slate-900 font-medium"
                                : "text-slate-700 hover:bg-slate-50")
                          : (isOptionSelected 
                              ? "bg-rose-50 dark:bg-rose-950/40 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100/80 dark:hover:bg-rose-900/50" 
                              : isFocused
                                ? "bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60")
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isOptionSelected && (
                        <Check className={cn("w-4 h-4 shrink-0 ml-2", isLight ? "text-indigo-600" : "text-rose-600 dark:text-rose-400")} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
