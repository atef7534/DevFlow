"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  FolderKanban,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { getDailyWordIds, getWordSet } from "@/data/languages";
import {
  formatDate,
  getStreak,
  isSameLocalDay,
  localDateKey,
} from "@/utils/dates";
import { Badge, Button, PageHeading, ProgressBar } from "@/components/ui";
import {
  getAllTasks,
  projectProgress,
} from "@/components/workspace/ProjectTaskPages";

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function TaskPreview({ task, onToggle }) {
  return (
    <div
      className={`today-task ${task.status === "Completed" ? "today-task-done" : ""}`}
    >
      <button
        className={`task-check ${task.status === "Completed" ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={
          task.status === "Completed"
            ? `Reopen ${task.title}`
            : `Complete ${task.title}`
        }
      >
        {task.status === "Completed" ? <Check size={12} /> : <span />}
      </button>
      <div className="today-task-copy">
        <strong>{task.title}</strong>
        <small>
          {task.projectName}
          {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
        </small>
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
    </div>
  );
}

function TodayLanguage({ language, progress, onPractice }) {
  const dateKey = localDateKey();
  const words = getDailyWordIds(language, dateKey)
    .map((id) => getWordSet(language.id).find((entry) => entry.id === id))
    .filter(Boolean);
  const session = progress.dailySessions[`${dateKey}:${language.id}`];
  const answers = session?.answers ?? {};
  const completeCount = words.filter((word) => answers[word.id]).length;
  const first = words.find((word) => !answers[word.id]) ?? words[0];
  return (
    <article
      className="today-language-card"
      style={{ "--language-accent": language.color }}
    >
      <div className="today-language-top">
        <span className="language-mark">{language.name.slice(0, 1)}</span>
        <div>
          <strong>{language.name}</strong>
          <small>
            {language.level} <span>→</span> {language.targetLevel} · self-set
          </small>
        </div>
        <span className="today-language-streak">
          <Flame size={13} />
          {getStreak(language.completedDays)}
        </span>
      </div>
      <div className="today-word">
        <span className="eyebrow">{language.dailyWords} WORDS FOR TODAY</span>
        <strong>{first?.term ?? "Your next word"}</strong>
        <small>
          {first
            ? `${first.part} · ${first.meaning}`
            : "Open your learning plan to add a word set."}
        </small>
      </div>
      <div className="today-language-foot">
        <span>
          {completeCount} / {language.dailyWords} explored
        </span>
        <button onClick={onPractice}>
          Continue practice <ArrowRight size={13} />
        </button>
      </div>
      <ProgressBar
        value={
          language.dailyWords ? (completeCount / language.dailyWords) * 100 : 0
        }
        color="var(--language-accent)"
        label={`${language.name} daily words`}
      />
    </article>
  );
}

export default function TodayPage() {
  const { workspace, actions } = useWorkspace();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
  }, []);
  const dateKey = localDateKey();
  const allTasks = getAllTasks(workspace.projects);
  const openTasks = useMemo(
    () =>
      allTasks
        .filter((task) => task.status !== "Completed")
        .sort(
          (a, b) =>
            ["High", "Medium", "Low"].indexOf(a.priority) -
              ["High", "Medium", "Low"].indexOf(b.priority) ||
            (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
        ),
    [allTasks],
  );
  const todayFocus = workspace.focusSessions
    .filter((session) => isSameLocalDay(session.date, dateKey))
    .reduce((sum, session) => sum + session.minutes, 0);
  const activeProjects = workspace.projects.filter(
    (project) => !["Completed", "Archived"].includes(project.status),
  );
  const activeLanguages = workspace.languages.filter(
    (language) => language.enabled,
  );
  const maxStreak = Math.max(
    0,
    ...workspace.languages.map((language) => getStreak(language.completedDays)),
  );
  const timer = workspace.timer;
  const timerLabel = `${String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:${String(timer.remaining % 60).padStart(2, "0")}`;
  const dateLabel = now
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now)
    : "Your day, at your pace";

  return (
    <>
      <div className="today-welcome">
        <div>
          <div className="eyebrow">{dateLabel.toUpperCase()}</div>
          <h1>
            {now
              ? `${greetingForHour(now.getHours())}, ${workspace.profile.name.split(" ")[0]}.`
              : "A good day to make progress."}
          </h1>
          <p>Here’s what matters today.</p>
        </div>
        <Link
          className="today-date-note"
          href="/tasks"
          aria-label="Open your task plan"
        >
          <Sparkles size={14} />
          <span>
            Keep it small.
            <br />
            <strong>Keep it moving.</strong>
          </span>
          <ArrowRight className="today-date-arrow" size={15} />
        </Link>
      </div>

      <div className="overview-strip" aria-label="Today's overview">
        <div className="overview-item">
          <span className="overview-icon violet">
            <ListIcon />
          </span>
          <div>
            <strong>{openTasks.length}</strong>
            <small>tasks left</small>
          </div>
        </div>
        <div className="overview-item">
          <span className="overview-icon amber">
            <BookOpen size={15} />
          </span>
          <div>
            <strong>
              {activeLanguages.reduce(
                (sum, language) => sum + language.dailyWords,
                0,
              )}
            </strong>
            <small>words to learn</small>
          </div>
        </div>
        <div className="overview-item">
          <span className="overview-icon blue">
            <Timer size={15} />
          </span>
          <div>
            <strong>
              {todayFocus}
              <i>m</i>
            </strong>
            <small>focus today</small>
          </div>
        </div>
        <div className="overview-item">
          <span className="overview-icon green">
            <FolderKanban size={15} />
          </span>
          <div>
            <strong>{activeProjects.length}</strong>
            <small>active projects</small>
          </div>
        </div>
        <div className="overview-item streak-overview">
          <span className="overview-icon amber">
            <Flame size={15} />
          </span>
          <div>
            <strong>
              {maxStreak}
              <i>d</i>
            </strong>
            <small>learning streak</small>
          </div>
        </div>
      </div>

      <div className="today-columns">
        <div className="today-main-column">
          <section className="today-section">
            <div className="section-title-row">
              <div>
                <h2>Today's next steps</h2>
                <p>A few useful things, picked from your open work.</p>
              </div>
              <Link className="section-link" href="/tasks">
                All tasks <ArrowRight size={13} />
              </Link>
            </div>
            <div className="surface today-tasks">
              {openTasks.length ? (
                openTasks
                  .slice(0, 4)
                  .map((task) => (
                    <TaskPreview
                      key={task.id}
                      task={task}
                      onToggle={() => actions.toggleTask(task.id)}
                    />
                  ))
              ) : (
                <div className="today-tasks-empty">
                  <CheckCircle2 size={17} />
                  <span>Nothing pressing. Enjoy the space.</span>
                  <Link href="/tasks">Add a task</Link>
                </div>
              )}
              {openTasks.length > 4 && (
                <Link href="/tasks" className="today-more-tasks">
                  + {openTasks.length - 4} more in your list{" "}
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </section>

          <section className="today-section">
            <div className="section-title-row">
              <div>
                <h2>A little language practice</h2>
                <p>Five useful words at a time. No rush.</p>
              </div>
              <Link className="section-link" href="/languages">
                Your languages <ArrowRight size={13} />
              </Link>
            </div>
            {activeLanguages.length ? (
              <div className="today-language-grid">
                {activeLanguages.slice(0, 2).map((language) => (
                  <TodayLanguage
                    key={language.id}
                    language={language}
                    progress={workspace}
                    onPractice={() => {
                      actions.ensureDailySession(language.id);
                      window.location.assign(
                        `/languages/today?language=${language.id}`,
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="surface today-empty-language">
                <BookOpen size={18} />
                <span>
                  <strong>Make room for a language.</strong>
                  <small>Add one to get a small word set each day.</small>
                </span>
                <Link
                  className="button button-secondary button-sm"
                  href="/languages"
                >
                  Add a language <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </section>

          <section className="today-section">
            <div className="section-title-row">
              <div>
                <h2>Recently in motion</h2>
                <p>Pick up where the work last left you.</p>
              </div>
              <Link className="section-link" href="/projects">
                All projects <ArrowRight size={13} />
              </Link>
            </div>
            <div className="today-project-list">
              {activeProjects.slice(0, 3).map((project) => (
                <Link
                  className={`today-project-line project-${project.color}`}
                  href={`/projects/${project.id}`}
                  key={project.id}
                >
                  <span className="project-symbol">
                    <Code2 size={15} />
                  </span>
                  <span className="today-project-copy">
                    <strong>{project.name}</strong>
                    <small>
                      {project.technology.slice(0, 2).join(" · ") ||
                        "Independent project"}
                    </small>
                  </span>
                  <span className="today-project-progress">
                    <ProgressBar
                      value={projectProgress(project)}
                      color="var(--project-color)"
                      label={`${project.name} progress`}
                    />
                    <small>{projectProgress(project)}%</small>
                  </span>
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="today-side-column">
          <section className="focus-nudge surface">
            <div className="focus-nudge-top">
              <span className="focus-glyph">
                <Timer size={16} />
              </span>
              <Badge tone="violet">A little focus</Badge>
            </div>
            <h2>
              Give one thing
              <br />
              your full attention.
            </h2>
            <p>
              Start a quiet session. You can connect it to any project or task.
            </p>
            <div className="focus-nudge-timer">
              {timerLabel}
              <span>
                {timer.status === "running" ? "IN SESSION" : "MINUTES OF FOCUS"}
              </span>
            </div>
            <div className="focus-nudge-actions">
              {timer.status === "running" ? (
                <Button variant="secondary" onClick={actions.pauseTimer}>
                  Pause session
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (timer.status === "finished") actions.finishTimer();
                    actions.startTimer();
                  }}
                >
                  Start {Math.round(timer.duration / 60)} minutes{" "}
                  <ArrowRight size={14} />
                </Button>
              )}
              <Link href="/focus">Open focus mode</Link>
            </div>
          </section>

          <section className="today-section">
            <div className="section-title-row">
              <div>
                <h2>A small weekly rhythm</h2>
                <p>Focus time recorded, by day.</p>
              </div>
              <Link
                href="/analytics"
                aria-label="Open analytics"
                className="subtle-icon-link"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="surface rhythm-card">
              <div className="rhythm-bars">
                {weekRhythm(workspace.focusSessions).map((day) => (
                  <div className="rhythm-day" key={day.key}>
                    <div className="rhythm-bar-wrap">
                      <span
                        style={{ height: `${Math.max(4, day.minutes / 2)}%` }}
                        title={`${day.minutes} focus minutes`}
                      />
                    </div>
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
              <div className="rhythm-footer">
                <span>This week</span>
                <strong>
                  {workspace.focusSessions
                    .filter(
                      (session) =>
                        new Date(session.date).getTime() >=
                        Date.now() - 7 * 86400000,
                    )
                    .reduce((sum, session) => sum + session.minutes, 0)}{" "}
                  focus min
                </strong>
              </div>
            </div>
          </section>

          <section className="quick-note">
            <div className="quick-note-icon">
              <NotebookIcon />
            </div>
            <div>
              <strong>Keep a thought nearby</strong>
              <p>Capture a code detail or a phrase before it slips.</p>
              <Link href="/notes">
                Open your notes <ArrowRight size={12} />
              </Link>
            </div>
            <Link
              href="/notes"
              className="quick-note-plus"
              aria-label="Open notes"
            >
              <Plus size={15} />
            </Link>
          </section>
          {workspace.profile.isSample && (
            <div className="sample-note">
              <span />
              Sample workspace{" "}
              <small>Language levels are user-set and editable.</small>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function ListIcon() {
  return (
    <span className="tiny-list-icon">
      <i />
      <i />
      <i />
    </span>
  );
}
function NotebookIcon() {
  return <BookOpen size={16} />;
}

function weekRhythm(sessions) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = localDateKey(date);
    return {
      key,
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" })
        .format(date)
        .slice(0, 1),
      minutes: sessions
        .filter((session) => isSameLocalDay(session.date, key))
        .reduce((sum, session) => sum + session.minutes, 0),
    };
  });
}
