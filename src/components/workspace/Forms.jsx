"use client";

import { useState } from "react";
import {
  Button,
  Field,
  Modal,
  SelectField,
  TextAreaField,
} from "@/components/ui";
import { cefrLevels, languageCatalog } from "@/data/languages";

const colors = ["violet", "blue", "green", "amber"];

export function ProjectForm({ initial, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    technology: initial?.technology?.join(", ") ?? "",
    status: initial?.status ?? "Planning",
    deadline: initial?.deadline ?? "",
    repository: initial?.repository ?? "",
    color: initial?.color ?? "violet",
  }));
  const change = (key) => (event) =>
    setDraft((current) => ({ ...current, [key]: event.target.value }));
  return (
    <Modal
      title={initial ? "Edit project" : "Start a project"}
      description="Give the work a name and a place to land."
      onClose={onClose}
      size="lg"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            ...draft,
            name: draft.name.trim(),
            technology: draft.technology
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean),
          });
        }}
      >
        <div className="form-grid">
          <Field
            className="field-full"
            label="Project name"
            value={draft.name}
            onChange={change("name")}
            required
            maxLength={70}
            placeholder="A name that helps you find it again"
          />
          <TextAreaField
            className="field-full"
            label="Description"
            value={draft.description}
            onChange={change("description")}
            rows={3}
            maxLength={300}
            placeholder="What are you making?"
          />
          <Field
            label="Technology"
            value={draft.technology}
            onChange={change("technology")}
            placeholder="React, CSS, API"
            hint="Separate tools with commas."
          />
          <SelectField
            label="Status"
            value={draft.status}
            onChange={change("status")}
          >
            <option>Planning</option>
            <option>In progress</option>
            <option>On hold</option>
            <option>Completed</option>
            <option>Archived</option>
          </SelectField>
          <Field
            label="Deadline"
            type="date"
            value={draft.deadline}
            onChange={change("deadline")}
          />
          <Field
            label="GitHub repository"
            value={draft.repository}
            onChange={change("repository")}
            placeholder="username/repository"
          />
          <SelectField
            label="Project accent"
            value={draft.color}
            onChange={change("color")}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color[0].toUpperCase() + color.slice(1)}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="modal-actions">
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TaskForm({
  initial,
  projects,
  defaultProjectId,
  onSave,
  onClose,
}) {
  const [draft, setDraft] = useState(() => ({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "Todo",
    priority: initial?.priority ?? "Medium",
    tags: initial?.tags?.join(", ") ?? "",
    dueDate: initial?.dueDate ?? "",
    projectId: initial?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "",
  }));
  const change = (key) => (event) =>
    setDraft((current) => ({ ...current, [key]: event.target.value }));
  return (
    <Modal
      title={initial ? "Edit task" : "Add a task"}
      description="Keep the next step small and clear."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            ...draft,
            title: draft.title.trim(),
            tags: draft.tags
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean),
          });
        }}
      >
        <div className="form-grid">
          <Field
            className="field-full"
            label="Task"
            value={draft.title}
            onChange={change("title")}
            required
            maxLength={100}
            placeholder="What needs doing?"
          />
          <TextAreaField
            className="field-full"
            label="Description"
            value={draft.description}
            onChange={change("description")}
            rows={3}
            maxLength={500}
            placeholder="Add context if it will help later."
          />
          <SelectField
            label="Project"
            value={draft.projectId}
            onChange={change("projectId")}
            required
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Status"
            value={draft.status}
            onChange={change("status")}
          >
            <option>Todo</option>
            <option>In progress</option>
            <option>Completed</option>
          </SelectField>
          <SelectField
            label="Priority"
            value={draft.priority}
            onChange={change("priority")}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </SelectField>
          <Field
            label="Due date"
            type="date"
            value={draft.dueDate}
            onChange={change("dueDate")}
          />
          <Field
            className="field-full"
            label="Tags"
            value={draft.tags}
            onChange={change("tags")}
            placeholder="UI, Research"
            hint="Separate tags with commas."
          />
        </div>
        <div className="modal-actions">
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Save task" : "Add task"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function NoteForm({ initial, projects, languages, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    tags: initial?.tags?.join(", ") ?? "",
    projectId: initial?.projectId ?? "",
    languageId: initial?.languageId ?? "",
    pinned: initial?.pinned ?? false,
  }));
  const change = (key) => (event) =>
    setDraft((current) => ({ ...current, [key]: event.target.value }));
  return (
    <Modal
      title={initial ? "Edit note" : "A note worth keeping"}
      description="For a code pattern, a useful phrase, or whatever you want to remember."
      onClose={onClose}
      size="lg"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            ...draft,
            title: draft.title.trim(),
            tags: draft.tags
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean),
          });
        }}
      >
        <div className="form-grid">
          <Field
            className="field-full"
            label="Title"
            value={draft.title}
            onChange={change("title")}
            required
            maxLength={90}
            placeholder="An idea to come back to"
          />
          <TextAreaField
            className="field-full note-editor-content"
            label="Your note"
            value={draft.content}
            onChange={change("content")}
            required
            rows={7}
            maxLength={6000}
            placeholder="Write in your own words…"
          />
          <SelectField
            label="Project"
            value={draft.projectId}
            onChange={change("projectId")}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Language"
            value={draft.languageId}
            onChange={change("languageId")}
          >
            <option value="">General note</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </SelectField>
          <Field
            className="field-full"
            label="Tags"
            value={draft.tags}
            onChange={change("tags")}
            placeholder="React, Hooks"
            hint="Separate tags with commas."
          />
          <label className="check-field field-full">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  pinned: event.target.checked,
                }))
              }
            />
            <span>Keep this note pinned at the top</span>
          </label>
        </div>
        <div className="modal-actions">
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Save note" : "Save note"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AddLanguageForm({ languages, onSave, onClose }) {
  const available = languageCatalog.filter(
    (language) => !languages.some((item) => item.id === language.id),
  );
  const [languageId, setLanguageId] = useState(available[0]?.id ?? "");
  const [level, setLevel] = useState("A1");
  const [targetLevel, setTargetLevel] = useState("B1");
  const selected = languageCatalog.find((item) => item.id === languageId);
  return (
    <Modal
      title="Add a language"
      description="Set your own starting point. This is not a placement test."
      onClose={onClose}
    >
      {available.length ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(languageId, level, targetLevel);
          }}
        >
          <div className="form-grid">
            <SelectField
              className="field-full"
              label="Language"
              value={languageId}
              onChange={(event) => {
                setLanguageId(event.target.value);
                const found = languageCatalog.find(
                  (item) => item.id === event.target.value,
                );
                setLevel(found?.defaultLevel ?? "A1");
                setTargetLevel("B1");
              }}
            >
              {available.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.nativeName}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Current level · self-set"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              {cefrLevels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
            <SelectField
              label="Target level"
              value={targetLevel}
              onChange={(event) => setTargetLevel(event.target.value)}
            >
              {cefrLevels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
            <div
              className="language-color-note field-full"
              style={{ "--language-accent": selected?.color }}
            >
              Words will use the bundled {selected?.name ?? "language"}{" "}
              vocabulary set while you learn. You can change the levels and
              daily goal later.
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add language</Button>
          </div>
        </form>
      ) : (
        <div className="empty-state">
          <p>All available language sets are already in your workspace.</p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}

export function LanguageSettingsForm({ language, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({
    level: language.level,
    targetLevel: language.targetLevel,
    dailyWords: language.dailyWords,
    preferredTime: language.preferredTime || "20:00",
    enabled: language.enabled,
    difficulty: language.difficulty || "Balanced",
  }));
  const change = (key) => (event) =>
    setDraft((current) => ({
      ...current,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  return (
    <Modal
      title={`${language.name} learning plan`}
      description="These levels are your settings and aren’t assessed automatically."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...draft, dailyWords: Number(draft.dailyWords) });
        }}
      >
        <div className="form-grid">
          <SelectField
            label="Current level"
            value={draft.level}
            onChange={change("level")}
          >
            {cefrLevels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField
            label="Target level"
            value={draft.targetLevel}
            onChange={change("targetLevel")}
          >
            {cefrLevels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField
            label="Words each day"
            value={draft.dailyWords}
            onChange={change("dailyWords")}
          >
            {[3, 5, 8, 10].map((count) => (
              <option value={count} key={count}>
                {count} words
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Difficulty preference"
            value={draft.difficulty}
            onChange={change("difficulty")}
          >
            <option>Gentle</option>
            <option>Balanced</option>
            <option>Stretch</option>
          </SelectField>
          <Field
            label="Preferred learning time"
            type="time"
            value={draft.preferredTime}
            onChange={change("preferredTime")}
          />
          <label className="check-field align-center">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={change("enabled")}
            />
            <span>Include in daily practice</span>
          </label>
        </div>
        <div className="modal-actions">
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save learning plan</Button>
        </div>
      </form>
    </Modal>
  );
}
