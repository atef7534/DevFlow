"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { formatDate, localDateKey } from "@/utils/dates";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  IconButton,
  Modal,
  PageHeading,
  ProgressBar,
  SelectField,
} from "@/components/ui";
import { ProjectForm, TaskForm } from "@/components/workspace/Forms";

export function projectProgress(project) {
  if (project.status === "Completed") return 100;
  const total = project.tasks.length;
  if (!total) return 0;
  return Math.round(
    (project.tasks.filter((task) => task.status === "Completed").length /
      total) *
      100,
  );
}

export function getAllTasks(projects) {
  return projects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color,
    })),
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const total = project.tasks.length;
  const done = project.tasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const percent = projectProgress(project);
  return (
    <article className={`project-card project-${project.color}`}>
      <div className="project-card-top">
        <span className="project-symbol">
          <FolderKanban size={17} />
        </span>
        <Badge
          tone={
            project.status === "Completed"
              ? "green"
              : project.status === "On hold"
                ? "amber"
                : "violet"
          }
        >
          {project.status}
        </Badge>
        <div className="project-card-menu">
          <IconButton label="Edit project" onClick={onEdit}>
            <Pencil size={14} />
          </IconButton>
          <IconButton label="Delete project" onClick={onDelete}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <Link href={`/projects/${project.id}`} className="project-card-title">
        <h2>{project.name}</h2>
        <ArrowUpRight size={15} />
      </Link>
      <p className="project-card-description">
        {project.description || "A project with room to take shape."}
      </p>
      <div className="project-tech">
        {project.technology.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <div className="project-card-progress">
        <div>
          <span>
            {done} of {total} tasks
          </span>
          <strong>{percent}%</strong>
        </div>
        <ProgressBar
          value={percent}
          color="var(--project-color)"
          label={`${project.name} progress`}
        />
      </div>
      <div className="project-card-foot">
        <span>
          {project.deadline ? (
            <>
              <CalendarDays size={12} /> Due {formatDate(project.deadline)}
            </>
          ) : (
            <>
              <Clock3 size={12} /> Open-ended
            </>
          )}
        </span>
        <span>
          {project.tasks.filter((task) => task.status !== "Completed").length}{" "}
          remaining
        </span>
      </div>
    </article>
  );
}

export function ProjectsPage() {
  const { workspace, actions } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Active");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const filtered = useMemo(
    () =>
      workspace.projects.filter((project) => {
        const matchesText =
          `${project.name} ${project.description} ${project.technology.join(" ")}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase());
        const matchesStatus =
          status === "All" ||
          (status === "Active"
            ? !["Completed", "Archived"].includes(project.status)
            : project.status === status);
        return matchesText && matchesStatus;
      }),
    [workspace.projects, query, status],
  );
  const save = (value) => {
    if (editor?.id) actions.updateProject(editor.id, value);
    else actions.createProject(value);
    setEditor(null);
  };
  return (
    <>
      <PageHeading
        eyebrow="THE WORK IN MOTION"
        title="Projects"
        description="Keep the bigger picture close while you work through the next small thing."
        action={
          <Button onClick={() => setEditor({})}>
            <Plus size={15} /> New project
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a project…"
            aria-label="Search projects"
          />
        </div>
        <div className="filter-pills">
          {["Active", "All", "Completed", "On hold"].map((item) => (
            <button
              key={item}
              className={`filter-pill ${status === item ? "selected" : ""}`}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="toolbar-count">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </span>
      </div>
      {filtered.length ? (
        <div className="projects-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditor(project)}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={query ? "No project found" : "Nothing in this view yet"}
          description={
            query
              ? "Try a different name, tool, or description."
              : "Start with the work you want to make room for."
          }
          action={
            !query && (
              <Button onClick={() => setEditor({})}>
                <Plus size={14} /> Start a project
              </Button>
            )
          }
        />
      )}
      {editor && (
        <ProjectForm
          initial={editor.id ? editor : null}
          onSave={save}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && (
        <Modal
          title="Remove this project?"
          description={`“${deleting.name}” and its tasks will be removed from this workspace.`}
          onClose={() => setDeleting(null)}
        >
          <div className="modal-actions">
            <Button variant="quiet" onClick={() => setDeleting(null)}>
              Keep project
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.deleteProject(deleting.id);
                setDeleting(null);
              }}
            >
              Remove project
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === "Completed";
  const dueOver = task.dueDate && task.dueDate < localDateKey() && !done;
  return (
    <article className={`task-row ${done ? "task-row-done" : ""}`}>
      <button
        className={`task-check ${done ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
      >
        {done ? <Check size={13} /> : <Circle size={15} />}
      </button>
      <div className="task-main">
        <button className="task-title-button" onClick={onEdit}>
          {task.title}
        </button>
        <div className="task-subline">
          <Link
            href={`/projects/${task.projectId}`}
            className={`task-project-dot dot-${task.projectColor ?? "violet"}`}
          >
            {task.projectName}
          </Link>
          {task.tags?.map((tag) => (
            <span className="task-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Badge
        tone={
          task.priority === "High"
            ? "red"
            : task.priority === "Low"
              ? "neutral"
              : "amber"
        }
      >
        {task.priority}
      </Badge>
      <span className={`task-due ${dueOver ? "overdue" : ""}`}>
        {task.dueDate ? (
          <>
            <CalendarDays size={12} />
            {formatDate(task.dueDate)}
          </>
        ) : (
          <span className="no-due">—</span>
        )}
      </span>
      <div className="task-row-actions">
        <IconButton label="Edit task" onClick={onEdit}>
          <Pencil size={13} />
        </IconButton>
        <IconButton label="Delete task" onClick={onDelete}>
          <Trash2 size={13} />
        </IconButton>
      </div>
    </article>
  );
}

function TaskCollection({ tasks, actions, onEdit, onDelete }) {
  if (!tasks.length)
    return (
      <EmptyState
        icon={ListTodo}
        title="No tasks in this view"
        description="Try another filter, or capture the next thing to do."
      />
    );
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggle={() => actions.toggleTask(task.id)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
        />
      ))}
    </div>
  );
}

export function TasksPage() {
  const { workspace, actions } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Any priority");
  const [sort, setSort] = useState("Due date");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const all = getAllTasks(workspace.projects);
  const filtered = useMemo(
    () =>
      all
        .filter((task) => {
          const textMatch =
            `${task.title} ${task.description ?? ""} ${task.projectName} ${task.tags?.join(" ")}`
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase());
          const statusMatch =
            status === "All" ||
            (status === "Open"
              ? task.status !== "Completed"
              : task.status === status);
          const priorityMatch =
            priority === "Any priority" || task.priority === priority;
          return textMatch && statusMatch && priorityMatch;
        })
        .sort((a, b) =>
          sort === "Priority"
            ? ["High", "Medium", "Low"].indexOf(a.priority) -
              ["High", "Medium", "Low"].indexOf(b.priority)
            : sort === "Recently added"
              ? b.createdAt.localeCompare(a.createdAt)
              : (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
        ),
    [all, query, status, priority, sort],
  );
  const saveTask = (value) => {
    const targetProjectId = value.projectId;
    const { projectId, ...task } = value;
    if (editor?.id)
      actions.updateTask(editor.id, { ...task, projectId: targetProjectId });
    else actions.createTask(targetProjectId, task);
    setEditor(null);
  };
  return (
    <>
      <PageHeading
        eyebrow="THE NEXT RIGHT THING"
        title="Tasks"
        description="A clear list is useful. A short, honest list is even better."
        action={
          <Button
            onClick={() => setEditor({})}
            disabled={!workspace.projects.length}
          >
            <Plus size={15} /> New task
          </Button>
        }
      />
      <div className="task-summary-row">
        <div>
          <strong>
            {all.filter((task) => task.status !== "Completed").length}
          </strong>
          <span>open</span>
        </div>
        <div>
          <strong>
            {
              all.filter(
                (task) =>
                  task.priority === "High" && task.status !== "Completed",
              ).length
            }
          </strong>
          <span>high priority</span>
        </div>
        <div>
          <strong>
            {all.filter((task) => task.status === "Completed").length}
          </strong>
          <span>completed</span>
        </div>
        <div className="task-summary-note">
          Tasks belong to projects, so progress stays in sync.
        </div>
      </div>
      <div className="toolbar">
        <div className="search-field">
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, projects, tags…"
            aria-label="Search tasks"
          />
        </div>
        <SelectField
          label="Filter by priority"
          className="compact-select"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option>Any priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </SelectField>
        <SelectField
          label="Sort tasks"
          className="compact-select"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option>Due date</option>
          <option>Priority</option>
          <option>Recently added</option>
        </SelectField>
        <span className="toolbar-count">{filtered.length} results</span>
      </div>
      <div className="filter-pills task-tabs">
        {["Open", "All", "In progress", "Completed"].map((item) => (
          <button
            key={item}
            className={`filter-pill ${status === item ? "selected" : ""}`}
            onClick={() => setStatus(item)}
          >
            {item}
            {item === "Open" && (
              <span>
                {all.filter((task) => task.status !== "Completed").length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="task-list-header">
        <span>Task</span>
        <span>Priority</span>
        <span>Due</span>
        <span />
      </div>
      <TaskCollection
        tasks={filtered}
        actions={actions}
        onEdit={setEditor}
        onDelete={setDeleting}
      />
      {!workspace.projects.length && (
        <div className="inline-callout">
          Start a project first to give your tasks a home.{" "}
          <Link href="/projects">
            Go to projects <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
      {editor && (
        <TaskForm
          initial={editor.id ? editor : null}
          projects={workspace.projects}
          defaultProjectId={editor.projectId}
          onSave={saveTask}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && (
        <Modal
          title="Delete this task?"
          description={`“${deleting.title}” will be removed from ${deleting.projectName}.`}
          onClose={() => setDeleting(null)}
        >
          <div className="modal-actions">
            <Button variant="quiet" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.deleteTask(deleting.id);
                setDeleting(null);
              }}
            >
              Delete task
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function ProjectDetailPage({ projectId }) {
  const { workspace, actions } = useWorkspace();
  const project = workspace.projects.find((item) => item.id === projectId);
  const [editor, setEditor] = useState(false);
  const [taskEditor, setTaskEditor] = useState(null);
  const percent = project ? projectProgress(project) : 0;
  if (!project)
    return (
      <>
        <Link href="/projects" className="back-link">
          <ArrowLeft size={14} /> All projects
        </Link>
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="It may have been removed from this workspace."
          action={
            <Button
              variant="secondary"
              onClick={() => window.location.assign("/projects")}
            >
              Back to projects
            </Button>
          }
        />
      </>
    );
  const done = project.tasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const saveTask = (value) => {
    const { projectId: target, ...task } = value;
    if (taskEditor?.id)
      actions.updateTask(taskEditor.id, { ...task, projectId: target });
    else actions.createTask(target, task);
    setTaskEditor(null);
  };
  return (
    <>
      <Link href="/projects" className="back-link">
        <ArrowLeft size={14} /> All projects
      </Link>
      <div className={`detail-project-head project-${project.color}`}>
        <div className="detail-project-top">
          <span className="project-symbol">
            <FolderKanban size={18} />
          </span>
          <Badge tone={project.status === "Completed" ? "green" : "violet"}>
            {project.status}
          </Badge>
          <span className="detail-project-date">
            Started {formatDate(project.createdAt)}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setEditor(true)}>
            <Pencil size={12} /> Edit
          </Button>
        </div>
        <h1>{project.name}</h1>
        <p>{project.description || "A project with room to take shape."}</p>
        <div className="detail-project-foot">
          <div className="project-tech">
            {project.technology.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          {project.repository && (
            <a
              className="section-link"
              href={`https://github.com/${project.repository}`}
              target="_blank"
              rel="noreferrer"
            >
              {project.repository} <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>
      <div className="detail-stats">
        <div>
          <span>Progress</span>
          <strong>{percent}%</strong>
          <ProgressBar value={percent} color="var(--project-color)" />
        </div>
        <div>
          <span>Tasks</span>
          <strong>{project.tasks.length}</strong>
          <small>{done} completed</small>
        </div>
        <div>
          <span>Still open</span>
          <strong>{project.tasks.length - done}</strong>
          <small>
            {project.deadline
              ? `Due ${formatDate(project.deadline)}`
              : "No deadline set"}
          </small>
        </div>
        <div>
          <span>Focus time</span>
          <strong>
            {Math.floor(
              workspace.focusSessions
                .filter((item) => item.projectId === project.id)
                .reduce((sum, item) => sum + item.minutes, 0) / 60,
            )}
            h{" "}
            {workspace.focusSessions
              .filter((item) => item.projectId === project.id)
              .reduce((sum, item) => sum + item.minutes, 0) % 60}
            m
          </strong>
          <small>recorded in sessions</small>
        </div>
      </div>
      <div className="detail-content-grid">
        <section>
          <div className="section-title-row">
            <div>
              <h2>Project tasks</h2>
              <p>Progress follows the work below.</p>
            </div>
            <Button size="sm" onClick={() => setTaskEditor({})}>
              <Plus size={13} /> Add task
            </Button>
          </div>
          <TaskCollection
            tasks={getAllTasks([project])}
            actions={actions}
            onEdit={setTaskEditor}
            onDelete={(task) => actions.deleteTask(task.id)}
          />
        </section>
        <aside className="detail-side-column">
          <div className="surface surface-pad">
            <div className="section-title-row">
              <div>
                <h2>Project notes</h2>
                <p>Keep the context close.</p>
              </div>
              <Link className="section-link" href="/notes">
                Open notes ↗
              </Link>
            </div>
            {workspace.notes.filter((note) => note.projectId === project.id)
              .length ? (
              workspace.notes
                .filter((note) => note.projectId === project.id)
                .slice(0, 3)
                .map((note) => (
                  <Link
                    key={note.id}
                    href="/notes"
                    className="project-note-line"
                  >
                    <span>{note.pinned ? "⌑" : "↳"}</span>
                    <div>
                      <strong>{note.title}</strong>
                      <small>
                        {note.content.slice(0, 72)}
                        {note.content.length > 72 ? "…" : ""}
                      </small>
                    </div>
                  </Link>
                ))
            ) : (
              <p className="muted-copy">No notes linked to this project yet.</p>
            )}
          </div>
          <div className="surface surface-pad">
            <div className="section-title-row">
              <div>
                <h2>Recent focus</h2>
                <p>Time spent with this project.</p>
              </div>
              <Clock3 size={15} className="muted-icon" />
            </div>
            {workspace.focusSessions
              .filter((item) => item.projectId === project.id)
              .slice(0, 4)
              .map((session) => (
                <div className="focus-history-line" key={session.id}>
                  <span className={`category-mark ${session.category}`} />
                  <span>
                    {session.category === "language"
                      ? "Language learning"
                      : "Coding"}
                  </span>
                  <strong>{session.minutes}m</strong>
                  <small>{formatDate(session.date)}</small>
                </div>
              ))}
            {!workspace.focusSessions.some(
              (item) => item.projectId === project.id,
            ) && <p className="muted-copy">No focus sessions here yet.</p>}
          </div>
        </aside>
      </div>
      {editor && (
        <ProjectForm
          initial={project}
          onSave={(value) => {
            actions.updateProject(project.id, value);
            setEditor(false);
          }}
          onClose={() => setEditor(false)}
        />
      )}
      {taskEditor && (
        <TaskForm
          initial={taskEditor.id ? taskEditor : null}
          projects={workspace.projects}
          defaultProjectId={project.id}
          onSave={saveTask}
          onClose={() => setTaskEditor(null)}
        />
      )}
    </>
  );
}
