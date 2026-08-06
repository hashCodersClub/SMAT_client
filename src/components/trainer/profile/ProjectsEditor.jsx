import { useEffect, useState } from "react";
import {
  FiFolder,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
  FiExternalLink,
  FiCode,
} from "react-icons/fi";

const EMPTY_PROJECT = {
  title: "",
  description: "",
  technologies: [],
  projectUrl: "",
};

const ProjectsEditor = ({
  projects = [],
  editing = false,
  onChange,
}) => {
  const [items, setItems] = useState(projects);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    setItems(projects || []);
  }, [projects]);

  const updateParent = (list) => {
    setItems(list);
    if (onChange) {
      onChange(list);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_PROJECT);
    setTechInput("");
    setEditingIndex(-1);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const addTech = () => {
    const val = techInput.trim();
    if (!val) return;
    if (!form.technologies.includes(val)) {
      setForm((prev) => ({
        ...prev,
        technologies: [...prev.technologies, val],
      }));
    }
    setTechInput("");
  };

  const removeTech = (tech) => {
    setForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Project title is required.");
      return;
    }

    const newProject = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      projectUrl: form.projectUrl.trim(),
      technologies: form.technologies,
    };

    let updated = [...items];
    if (editingIndex >= 0) {
      updated[editingIndex] = newProject;
    } else {
      updated.push(newProject);
    }

    updateParent(updated);
    resetForm();
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    const item = items[index];
    setForm({
      title: item.title || "",
      description: item.description || "",
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      projectUrl: item.projectUrl || "",
    });
    setTechInput("");
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    updateParent(updated);
  };

  return (
    <div className="space-y-4">
      {/* Read View or Editing List */}
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm transition hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <FiFolder size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <FiExternalLink size={12} />
                          Visit Project
                        </a>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                )}
              </div>

              {item.technologies?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  {item.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <FiCode size={10} className="text-slate-400" />
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No projects added yet.
          </p>
        )
      )}

      {/* Add Project Button */}
      {editing && !showForm && (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-blue-500"
        >
          <FiPlus size={16} />
          Add Project
        </button>
      )}

      {/* Project Form Modal / Drawer Inline */}
      {editing && showForm && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-slate-800/80">
          <div className="mb-4 flex items-center justify-between border-b border-blue-100/60 pb-3 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingIndex >= 0 ? "Edit Project" : "Add New Project"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Enterprise LMS Platform Migration"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project URL (Optional)
              </label>
              <input
                type="url"
                name="projectUrl"
                value={form.projectUrl}
                onChange={handleChange}
                placeholder="https://example.com/project"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Technologies Used
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  placeholder="e.g. React, Node.js, AWS"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)}>
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description & Outcomes
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe key responsibilities, deliverables, and architecture..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <FiSave size={14} />
              {editingIndex >= 0 ? "Update Project" : "Save Project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsEditor;
