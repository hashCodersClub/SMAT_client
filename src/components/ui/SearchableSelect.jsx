import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| SearchableSelect
|--------------------------------------------------------------------------
|
| A single-value combobox: type to filter a predefined list of options,
| click (or press Enter on) one to select it. Used for fields like
| City / State where we want to steer admins toward consistent, predefined
| values instead of free-form typing, while still allowing a custom value
| (allowCustom) for places that aren't in the list.
|
*/

export const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Search...",
  allowCustom = true,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const showCustomOption =
    allowCustom &&
    query.trim() &&
    !options.some((opt) => opt.toLowerCase() === query.trim().toLowerCase());

  const selectValue = (val) => {
    onChange(val);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="relative">
        <FiSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
        />

        <input
          type="text"
          value={open ? query : value || ""}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={value ? value : placeholder}
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-blue-500"
        />

        {value && !open ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <FiX size={14} />
          </button>
        ) : (
          <FiChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          {filteredOptions.length === 0 && !showCustomOption && (
            <p className="px-3 py-2 text-xs text-slate-400">
              No matches found.
            </p>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => selectValue(opt)}
              className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                opt === value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-700"
              }`}
            >
              {opt}
            </button>
          ))}

          {showCustomOption && (
            <button
              type="button"
              onClick={() => selectValue(query.trim())}
              className="flex w-full items-center gap-1 border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Use "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SearchableMultiSelect
|--------------------------------------------------------------------------
|
| A multi-value version: selected values render as removable chips, and
| typing filters the predefined list below the input. Used for fields
| like Skills / Preferred Locations. allowCustom lets an admin add a value
| that isn't in the predefined list (e.g. a niche skill or smaller town).
|
*/

export const SearchableMultiSelect = ({
  label,
  values = [],
  onChange,
  options = [],
  placeholder = "Search...",
  allowCustom = true,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((opt) => {
      if (values.includes(opt)) return false;
      if (!q) return true;
      return opt.toLowerCase().includes(q);
    });
  }, [options, query, values]);

  const showCustomOption =
    allowCustom &&
    query.trim() &&
    !values.some((v) => v.toLowerCase() === query.trim().toLowerCase()) &&
    !options.some((opt) => opt.toLowerCase() === query.trim().toLowerCase());

  const addValue = (val) => {
    if (!val) return;
    if (!values.includes(val)) {
      onChange([...values, val]);
    }
    setQuery("");
  };

  const removeValue = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        className="flex min-h-[2.75rem] w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 transition focus-within:border-blue-500"
        onClick={() => setOpen(true)}
      >
        {values.map((val) => (
          <span
            key={val}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {val}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(val);
              }}
            >
              <FiX size={12} />
            </button>
          </span>
        ))}

        <div className="relative flex flex-1 items-center">
          <FiSearch
            className="pointer-events-none absolute left-1 text-slate-400"
            size={13}
          />
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (showCustomOption) {
                  addValue(query.trim());
                } else if (filteredOptions.length > 0) {
                  addValue(filteredOptions[0]);
                }
              } else if (e.key === "Backspace" && !query && values.length > 0) {
                removeValue(values[values.length - 1]);
              }
            }}
            placeholder={values.length === 0 ? placeholder : ""}
            className="min-w-[6rem] flex-1 border-none py-1 pl-5 text-sm outline-none"
          />
        </div>
      </div>

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          {filteredOptions.length === 0 && !showCustomOption && (
            <p className="px-3 py-2 text-xs text-slate-400">
              {options.length === values.length
                ? "All options selected."
                : "No matches found."}
            </p>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => addValue(opt)}
              className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              {opt}
            </button>
          ))}

          {showCustomOption && (
            <button
              type="button"
              onClick={() => addValue(query.trim())}
              className="flex w-full items-center gap-1 border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Add "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
