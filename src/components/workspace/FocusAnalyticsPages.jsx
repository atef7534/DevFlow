"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { getWordSet, languageCatalog } from "@/data/languages";
import {
  formatDate,
  getWeekKeys,
  isSameLocalDay,
  localDateKey,
} from "@/utils/dates";
import {
  Badge,
  Button,
  PageHeading,
  ProgressBar,
  SelectField,
} from "@/components/ui";
import { getAllTasks } from "@/components/workspace/ProjectTaskPages";

function formatTimer(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function sumMinutes(sessions) {
  return sessions.reduce((sum, session) => sum + session.minutes, 0);
}

export function FocusPage() {
  const { workspace, actions } = useWorkspace();
  const { timer } = workspace;
  const tasks = getAllTasks(workspace.projects).filter(
    (task) => task.status !== "Completed",
  );
  const [customMinutes, setCustomMinutes] = useState(35);
  const [customOpen, setCustomOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const today = workspace.focusSessions
    .filter((session) => isSameLocalDay(session.date))
    .reduce((sum, session) => sum + session.minutes, 0);
  const weekKeys = getWeekKeys();
  const week = workspace.focusSessions.filter((session) =>
    weekKeys.includes(localDateKey(new Date(session.date))),
  );
  const selectedTask = tasks.find((task) => task.id === timer.taskId);
  const projectForTask = selectedTask
    ? workspace.projects.find(
        (project) => project.id === selectedTask.projectId,
      )
    : null;
  const progress = timer.duration
    ? (timer.duration - timer.remaining) / timer.duration
    : 0;
  const circumference = 2 * Math.PI * 132;
  const running = timer.status === "running";
  const paused = timer.status === "paused";
  const finished = timer.status === "finished";

  const begin = () => {
    setSavedNotice(false);
    actions.setTimer({
      projectId: selectedTask?.projectId ?? timer.projectId,
      taskId: selectedTask?.id ?? "",
      category: timer.category,
    });
    actions.startTimer();
  };
  const finish = () => {
    actions.finishTimer();
    setSavedNotice(true);
  };
  const selectProject = (projectId) =>
    actions.setTimer({ projectId, taskId: "" });
  const projectId = selectedTask?.projectId ?? timer.projectId ?? "";
  const projectTasks = getAllTasks(workspace.projects).filter(
    (task) => task.projectId === projectId && task.status !== "Completed",
  );
  const todaySessions = workspace.focusSessions.filter((session) =>
    isSameLocalDay(session.date),
  );

  return (
    <>
      <PageHeading
        eyebrow="ONE THING AT A TIME"
        title="Focus"
        description="A quieter screen for giving one thing your attention."
      />
      <div className="focus-layout">
        <section
          className={`focus-console surface ${running ? "focus-running" : ""}`}
        >
          <div className="focus-console-head">
            <div>
              <span className="focus-live-dot" />
              {running
                ? "SESSION IN PROGRESS"
                : paused
                  ? "SESSION PAUSED"
                  : finished
                    ? "SESSION COMPLETE"
                    : "READY WHEN YOU ARE"}
            </div>
            <span className="focus-category-badge">
              {timer.category === "language" ? (
                <>
                  <BookOpen size={13} /> Language learning
                </>
              ) : timer.category === "other" ? (
                "Personal focus"
              ) : (
                <>
                  <Code2Tiny /> Coding time
                </>
              )}
            </span>
          </div>
          <div className="timer-dial">
            <svg viewBox="0 0 300 300" aria-hidden="true">
              <circle className="timer-dial-track" cx="150" cy="150" r="132" />
              <circle
                className="timer-dial-progress"
                cx="150"
                cy="150"
                r="132"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset:
                    circumference * (1 - Math.min(1, Math.max(0, progress))),
                }}
              />
            </svg>
            <div className="timer-dial-center">
              <span className="timer-display">
                {formatTimer(timer.remaining)}
              </span>
              <small>
                {running
                  ? "STAY WITH IT"
                  : paused
                    ? "PICK UP WHEN READY"
                    : finished
                      ? "YOU MADE THE TIME"
                      : `${Math.round(timer.duration / 60)} MINUTES`}
              </small>
              {finished && (
                <div className="timer-finished-note">
                  <CheckCircle2 size={13} /> Focus session saved
                </div>
              )}
            </div>
          </div>
          {savedNotice && !finished && (
            <div className="focus-save-notice">
              <CheckCircle2 size={13} /> Your focus time is in the session log.
            </div>
          )}
          <div className="timer-controls">
            {running ? (
              <Button
                variant="secondary"
                className="timer-control-main"
                onClick={actions.pauseTimer}
              >
                <Pause size={15} /> Pause
              </Button>
            ) : finished ? (
              <Button
                className="timer-control-main"
                onClick={() => {
                  actions.finishTimer();
                  setSavedNotice(false);
                }}
              >
                <RotateCcw size={15} /> Start another
              </Button>
            ) : (
              <Button className="timer-control-main" onClick={begin}>
                <Play size={15} fill="currentColor" />{" "}
                {paused ? "Continue session" : "Start focus"}
              </Button>
            )}
            {(running || paused) && (
              <>
                <Button variant="quiet" onClick={actions.resetTimer}>
                  <RotateCcw size={13} /> Reset
                </Button>
                <Button variant="quiet" onClick={finish}>
                  <CheckCircle2 size={14} /> Finish & save
                </Button>
              </>
            )}
          </div>
          <div className="timer-presets">
            {[25, 50, 90].map((minutes) => (
              <button
                className={timer.duration === minutes * 60 ? "selected" : ""}
                key={minutes}
                disabled={running}
                onClick={() => actions.setTimerMinutes(minutes)}
              >
                {minutes} min
              </button>
            ))}
            <button
              className={customOpen ? "selected" : ""}
              disabled={running}
              onClick={() => setCustomOpen((open) => !open)}
            >
              Custom
            </button>
            {customOpen && (
              <div className="custom-minutes">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customMinutes}
                  onChange={(event) =>
                    setCustomMinutes(Number(event.target.value))
                  }
                  aria-label="Custom session length in minutes"
                />
                <span>min</span>
                <button
                  onClick={() => {
                    const value = Math.max(
                      5,
                      Math.min(180, customMinutes || 5),
                    );
                    actions.setTimerMinutes(value);
                    setCustomOpen(false);
                  }}
                >
                  Set
                </button>
              </div>
            )}
          </div>
          <div className="focus-context">
            <label className="field">
              <span>WHAT ARE YOU FOCUSING ON?</span>
              <select
                value={projectId}
                onChange={(event) => selectProject(event.target.value)}
                disabled={running}
              >
                <option value="">Independent work</option>
                {workspace.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>LINK A TASK</span>
              <select
                value={selectedTask?.id ?? ""}
                onChange={(event) => {
                  const task = tasks.find(
                    (item) => item.id === event.target.value,
                  );
                  actions.setTimer({
                    taskId: task?.id ?? "",
                    projectId: task?.projectId ?? projectId,
                  });
                }}
                disabled={running}
              >
                <option value="">No task selected</option>
                {projectTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>SESSION TYPE</span>
              <select
                value={timer.category}
                onChange={(event) =>
                  actions.setTimer({ category: event.target.value })
                }
                disabled={running}
              >
                <option value="coding">Coding</option>
                <option value="language">Language learning</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <div className="focus-console-foot">
            <span>
              <Clock3 size={13} /> Timer keeps running as you move around
              DevFlow.
            </span>
            <span>Sessions save on completion or when you finish early.</span>
          </div>
        </section>
        <aside className="focus-aside">
          <div className="focus-today-card">
            <div className="eyebrow">TIME YOU MADE TODAY</div>
            <strong>
              {today}
              <i> min</i>
            </strong>
            <p>
              {today >= 60
                ? "A solid stretch of attention."
                : today
                  ? "A good start. Time adds up."
                  : "A little time still counts."}
            </p>
            <div className="focus-stat-breakdown">
              <span>
                <Code2Tiny /> Coding
              </span>
              <b>
                {sumMinutes(
                  todaySessions.filter((item) => item.category === "coding"),
                )}
                m
              </b>
              <span>
                <BookOpen size={13} /> Language
              </span>
              <b>
                {sumMinutes(
                  todaySessions.filter((item) => item.category === "language"),
                )}
                m
              </b>
            </div>
          </div>
          <div className="focus-week-card surface">
            <div className="section-title-row">
              <div>
                <h2>This week</h2>
                <p>{sumMinutes(week)} minutes so far</p>
              </div>
              <TrendingUp size={15} className="muted-icon" />
            </div>
            <div className="focus-week-list">
              {weekKeys.map((date) => {
                const minutes = sumMinutes(
                  week.filter(
                    (session) => localDateKey(new Date(session.date)) === date,
                  ),
                );
                const currentDay = date === localDateKey();
                return (
                  <div className="focus-week-day" key={date}>
                    <span>
                      {new Intl.DateTimeFormat(undefined, {
                        weekday: "short",
                      }).format(new Date(`${date}T12:00:00`))}
                    </span>
                    <div>
                      <ProgressBar
                        value={Math.min(100, (minutes / 90) * 100)}
                        color={currentDay ? "var(--accent)" : "var(--green)"}
                        label={`Focus on ${date}`}
                      />
                    </div>
                    <strong>{minutes ? `${minutes}m` : "—"}</strong>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="focus-aside-note">
            <span>
              <SparkleTiny />
            </span>
            <p>Let the timer hold the boundary. You just have to start.</p>
          </div>
        </aside>
      </div>
      <section className="focus-history-section">
        <div className="section-title-row">
          <div>
            <h2>Recent sessions</h2>
            <p>Time attached to a project, a language, or just to you.</p>
          </div>
          <Link href="/analytics" className="section-link">
            See analytics <ArrowRight size={13} />
          </Link>
        </div>
        {workspace.focusSessions.length ? (
          <div className="focus-session-list">
            {workspace.focusSessions.slice(0, 8).map((session) => {
              const project = workspace.projects.find(
                (item) => item.id === session.projectId,
              );
              const task = project?.tasks.find(
                (item) => item.id === session.taskId,
              );
              return (
                <div className="focus-session-line" key={session.id}>
                  <span className={`category-mark ${session.category}`} />{" "}
                  <span className="session-label">
                    {project?.name ??
                      (session.category === "language"
                        ? "Language learning"
                        : "Independent work")}
                    <small>
                      {task?.title ??
                        (session.category === "language"
                          ? "Vocabulary practice"
                          : session.completed
                            ? "Completed session"
                            : "Focus time")}
                    </small>
                  </span>
                  <Badge
                    tone={session.category === "language" ? "amber" : "blue"}
                  >
                    {session.category === "language"
                      ? "Language"
                      : session.category === "other"
                        ? "Other"
                        : "Coding"}
                  </Badge>
                  <strong>{session.minutes} min</strong>
                  <small>
                    {formatDate(session.date, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-inline">
            <Clock3 size={15} />
            No focus sessions yet. Start the timer when you’re ready.
          </div>
        )}
      </section>
    </>
  );
}

export function AnalyticsPage() {
  const { workspace } = useWorkspace();
  const sessions = workspace.focusSessions;
  const todayMinutes = sumMinutes(
    sessions.filter((session) => isSameLocalDay(session.date)),
  );
  const weekKeys = getWeekKeys();
  const weekSessions = sessions.filter((session) =>
    weekKeys.includes(localDateKey(new Date(session.date))),
  );
  const monthSessions = sessions.filter((session) => {
    const date = new Date(session.date);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  });
  const totals = {
    today: todayMinutes,
    week: sumMinutes(weekSessions),
    month: sumMinutes(monthSessions),
    all: sumMinutes(sessions),
  };
  const tasks = workspace.projects.flatMap((project) => project.tasks);
  const completeTasks = tasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const projectFocus = workspace.projects
    .map((project) => ({
      project,
      minutes: sumMinutes(
        sessions.filter((session) => session.projectId === project.id),
      ),
    }))
    .sort((a, b) => b.minutes - a.minutes);
  const maxSession = Math.max(0, ...sessions.map((session) => session.minutes));
  const avgSession = sessions.length
    ? Math.round(sumMinutes(sessions) / sessions.length)
    : 0;
  const daily = useMemo(
    () =>
      weekKeys.map((date) => ({
        date,
        day: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
          new Date(`${date}T12:00:00`),
        ),
        minutes: sumMinutes(
          weekSessions.filter(
            (session) => localDateKey(new Date(session.date)) === date,
          ),
        ),
      })),
    [workspace.focusSessions],
  );
  const maxDaily = Math.max(90, ...daily.map((day) => day.minutes));

  return (
    <>
      <PageHeading
        eyebrow="A RECORD OF SHOWING UP"
        title="Analytics"
        description="A real picture of what you've completed, where your time went, and how your practice is growing."
      />
      <div className="analytics-summary">
        {[
          ["Today", totals.today, "minutes focused"],
          ["This week", totals.week, "minutes focused"],
          ["This month", totals.month, "minutes focused"],
          ["All time", totals.all, "minutes focused"],
        ].map(([label, value, detail]) => (
          <div className="analytics-summary-item" key={label}>
            <span>{label}</span>
            <strong>
              {value}
              <i>m</i>
            </strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="surface analytics-chart-card">
          <div className="section-title-row">
            <div>
              <h2>Focus, day by day</h2>
              <p>Local week · minutes recorded</p>
            </div>
            <Badge tone="violet">
              <Clock3 size={11} /> {totals.week} min
            </Badge>
          </div>
          <div className="analytics-chart">
            <div className="chart-guides">
              <span>90</span>
              <span>60</span>
              <span>30</span>
              <span>0</span>
            </div>
            <div className="chart-columns">
              {daily.map((day) => (
                <div className="chart-day" key={day.date}>
                  <div className="chart-bar-area">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(day.minutes ? 5 : 0, (day.minutes / maxDaily) * 100)}%`,
                      }}
                      title={`${day.minutes} minutes`}
                    >
                      <span>{day.minutes ? day.minutes : ""}</span>
                    </div>
                  </div>
                  <small>{day.day.slice(0, 1)}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="analytics-chart-foot">
            <span>Quiet days belong here too.</span>
            <span>Based on saved focus sessions</span>
          </div>
        </section>
        <section className="surface analytics-task-card">
          <div className="section-title-row">
            <div>
              <h2>Work in progress</h2>
              <p>Tasks across {workspace.projects.length} projects</p>
            </div>
            <Link href="/tasks" className="subtle-icon-link">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="task-completion-ring">
            <div>
              <strong>
                {tasks.length
                  ? Math.round((completeTasks / tasks.length) * 100)
                  : 0}
                <i>%</i>
              </strong>
              <small>tasks completed</small>
            </div>
          </div>
          <div className="task-analytics-counts">
            <span>
              <i className="dot-open" /> Open{" "}
              <strong>{tasks.length - completeTasks}</strong>
            </span>
            <span>
              <i className="dot-done" /> Completed{" "}
              <strong>{completeTasks}</strong>
            </span>
            <span>
              <i className="dot-high" /> High priority{" "}
              <strong>
                {
                  tasks.filter(
                    (task) =>
                      task.priority === "High" && task.status !== "Completed",
                  ).length
                }
              </strong>
            </span>
          </div>
        </section>
      </div>

      <div className="analytics-lower-grid">
        <section className="surface analytics-project-card">
          <div className="section-title-row">
            <div>
              <h2>Where focus went</h2>
              <p>Total saved minutes by project.</p>
            </div>
            <Link href="/projects" className="section-link">
              Projects <ArrowRight size={12} />
            </Link>
          </div>
          {projectFocus.length ? (
            projectFocus.map(({ project, minutes }) => (
              <div className="project-focus-line" key={project.id}>
                <span className={`project-color-dot ${project.color}`} />
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
                <div>
                  <ProgressBar
                    value={totals.all ? (minutes / totals.all) * 100 : 0}
                    color={`var(--${project.color})`}
                    label={`${project.name} focus share`}
                  />
                </div>
                <strong>{minutes}m</strong>
              </div>
            ))
          ) : (
            <p className="muted-copy">
              Create a project to start tracking focus alongside your work.
            </p>
          )}
        </section>
        <section className="surface analytics-learning-card">
          <div className="section-title-row">
            <div>
              <h2>Learning, at your pace</h2>
              <p>Words and study days you have recorded.</p>
            </div>
            <Link href="/languages" className="subtle-icon-link">
              <BookOpen size={14} />
            </Link>
          </div>
          {workspace.languages.length ? (
            workspace.languages.map((language) => {
              const vocabularyIds = new Set(
                getWordSet(language.id).map((word) => word.id),
              );
              const records = Object.entries(workspace.vocabularyProgress)
                .filter(([id]) => vocabularyIds.has(id))
                .map(([, progress]) => progress);
              const learned = records.filter((item) =>
                ["Learning", "Mastered"].includes(item.status),
              ).length;
              const color =
                languageCatalog.find((item) => item.id === language.id)
                  ?.color ?? "var(--accent)";
              return (
                <Link
                  className="analytics-language-line"
                  href={`/languages/${language.id}`}
                  key={language.id}
                  style={{ "--language-accent": color }}
                >
                  <span className="language-mark">
                    {language.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{language.name}</strong>
                    <small>
                      {language.level} → {language.targetLevel} · self-set
                    </small>
                  </span>
                  <div>
                    <ProgressBar
                      value={
                        (learned / Math.max(1, vocabularyIds.size)) * 100
                      }
                      color="var(--language-accent)"
                      label={`${language.name} learned words`}
                    />
                    <small>
                      {learned} learned · {language.completedDays.length}{" "}
                      practice days
                    </small>
                  </div>
                  <ArrowRight size={13} />
                </Link>
              );
            })
          ) : (
            <p className="muted-copy">
              Add a language to begin a learning record.
            </p>
          )}
        </section>
      </div>
      <div className="analytics-footnote">
        <span>
          <BarChart3 size={14} />
        </span>
        <p>
          Analytics are calculated from your saved tasks, sessions, vocabulary
          progress, and practice days. The seed workspace is marked as sample
          data; add or edit records to make the picture yours.
        </p>
        <div>
          <span>
            <Trophy size={13} />
            Longest session
          </span>
          <strong>{maxSession} min</strong>
          <span>
            <Timer size={13} />
            Average session
          </span>
          <strong>{avgSession} min</strong>
        </div>
      </div>
    </>
  );
}

function Code2Tiny() {
  return <span className="tiny-code-icon">&lt;/&gt;</span>;
}
function SparkleTiny() {
  return <span className="tiny-sparkle">✳</span>;
}
