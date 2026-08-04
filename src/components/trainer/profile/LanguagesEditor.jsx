import { useEffect, useState } from "react";
import { FiGlobe, FiPlus, FiX } from "react-icons/fi";

const PROFICIENCY_OPTIONS = [
  ["BASIC", "Basic"],
  ["CONVERSATIONAL", "Conversational"],
  ["PROFESSIONAL", "Professional"],
  ["NATIVE", "Native"],
];

const PROFICIENCY_LABEL = Object.fromEntries(PROFICIENCY_OPTIONS);

const PROFICIENCY_STYLE = {
  BASIC: "border-slate-200/60 bg-slate-50/80 text-slate-600",
  CONVERSATIONAL: "border-blue-200/60 bg-blue-50/80 text-blue-700",
  PROFESSIONAL: "border-indigo-200/60 bg-indigo-50/80 text-indigo-700",
  NATIVE: "border-emerald-200/60 bg-emerald-50/80 text-emerald-700",
};

const EMPTY_LANGUAGE = { name: "", proficiency: "PROFESSIONAL" };

/*
|--------------------------------------------------------------------------
| Languages Editor
|--------------------------------------------------------------------------
|
| Lightweight add-a-language + proficiency picker, in the same visual
| language as the other trainer profile editors (Certifications,
| Employment, Education) but simpler - a language entry only ever needs a
| name and a proficiency level, so this skips the full add/edit modal
| pattern in favor of an inline add row + removable chip list.
|--------------------------------------------------------------------------
*/

const LanguagesEditor = ({ languages = [], editing = false, onChange }) => {
  const [items, setItems] = useState(languages);
  const [draft, setDraft] = useState(EMPTY_LANGUAGE);

  useEffect(() => {
    setItems(languages || []);
  }, [languages]);

  const updateParent = (list) => {
    setItems(list);

    if (onChange) {
      onChange(list);
    }
  };

  const addLanguage = () => {
    const name = draft.name.trim();

    if (!name) return;

    const exists = items.some(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      setDraft(EMPTY_LANGUAGE);
      return;
    }

    updateParent([...items, { name, proficiency: draft.proficiency }]);

    setDraft(EMPTY_LANGUAGE);
  };

  const removeLanguage = (name) => {
    updateParent(items.filter((item) => item.name !== name));
  };

  return (
    <div>
      {/* Count summary - always visible, editing or not */}

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400/80">
        {items.length === 0
          ? "No languages added"
          : `Speaks ${items.length} ${items.length === 1 ? "language" : "languages"}`}
      </p>

      {/* Add row */}

      {editing && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={draft.name}
            onChange={(e) =>
              setDraft((current) => ({ ...current, name: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLanguage();
              }
            }}
            placeholder="e.g. Hindi"
            className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400/60 hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm sm:flex-none sm:w-48"
          />

          <select
            value={draft.proficiency}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                proficiency: e.target.value,
              }))
            }
            className="rounded-xl border border-slate-200/80 bg-white/50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10"
          >
            {PROFICIENCY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={addLanguage}
            aria-label="Add language"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-blue-700 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
          >
            <FiPlus size={16} />
          </button>
        </div>
      )}

      {/* List */}

      {items.length === 0 ? (
        !editing && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center">
            <FiGlobe size={22} className="mx-auto text-slate-300" />
            <p className="text-sm text-slate-400">
              No languages added to this profile yet.
            </p>
          </div>
        )
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((language) => (
            <span
              key={language.name}
              className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                PROFICIENCY_STYLE[language.proficiency] ||
                PROFICIENCY_STYLE.PROFESSIONAL
              }`}
            >
              {language.name}

              <span className="text-xs font-medium opacity-70">
                {PROFICIENCY_LABEL[language.proficiency] || "Professional"}
              </span>

              {editing && (
                <button
                  type="button"
                  onClick={() => removeLanguage(language.name)}
                  className="flex h-4 w-4 items-center justify-center rounded-full opacity-60 transition-all hover:bg-red-100/80 hover:text-red-600 hover:opacity-100"
                  aria-label={`Remove ${language.name}`}
                >
                  <FiX size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguagesEditor;
