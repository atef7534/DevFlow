"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChartNoAxesCombined,
  CheckSquare2,
  ChevronRight,
  Cloud,
  CloudOff,
  Code2,
  Flame,
  FolderKanban,
  GitBranch,
  Home,
  Languages,
  ListTodo,
  Menu,
  Moon,
  NotebookPen,
  Search,
  Settings2,
  Sun,
  Timer,
  X,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { getWordSet } from "@/data/languages";
import { getStreak } from "@/utils/dates";
import { IconButton, LoadingState, Modal } from "@/components/ui";

const primaryNav = [
  { label: "Today", href: "/today", icon: Home },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Notes", href: "/notes", icon: NotebookPen },
  { label: "Focus", href: "/focus", icon: Timer },
  { label: "GitHub", href: "/github", icon: GitBranch },
  { label: "Languages", href: "/languages", icon: Languages },
  { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
];
const moreNav = [
  primaryNav[2],
  primaryNav[3],
  primaryNav[5],
  primaryNav[7],
  { label: "Settings", href: "/settings", icon: Settings2 },
];

function titleForPath(path) {
  if (path === "/settings") return "Settings";
  if (path.startsWith("/projects/")) return "Project";
  if (path.startsWith("/languages/today")) return "Today's words";
  if (path.startsWith("/languages/")) return "Language notes";
  return (
    primaryNav.find((item) => item.href === path)?.label ??
    (path === "/search" ? "Search" : "Today")
  );
}

function SearchPalette({ open, onClose }) {
  const { workspace } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim().toLocaleLowerCase();
  const tasks = workspace.projects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectName: project.name,
      href: "/tasks",
      kind: "Task",
    })),
  );
  const results = useMemo(() => {
    if (!q) return [];
    const projects = workspace.projects
      .filter((item) =>
        `${item.name} ${item.description} ${item.technology.join(" ")}`
          .toLocaleLowerCase()
          .includes(q),
      )
      .map((item) => ({
        title: item.name,
        subtitle: item.description,
        kind: "Project",
        href: `/projects/${item.id}`,
      }));
    const matchingTasks = tasks
      .filter((item) =>
        `${item.title} ${item.description ?? ""} ${item.projectName}`
          .toLocaleLowerCase()
          .includes(q),
      )
      .map((item) => ({
        title: item.title,
        subtitle: item.projectName,
        kind: "Task",
        href: item.href,
      }));
    const notes = workspace.notes
      .filter((item) =>
        `${item.title} ${item.content} ${item.tags.join(" ")}`
          .toLocaleLowerCase()
          .includes(q),
      )
      .map((item) => ({
        title: item.title,
        subtitle: item.tags.join(" · "),
        kind: "Note",
        href: "/notes",
      }));
    const languages = workspace.languages
      .filter((item) => item.name.toLocaleLowerCase().includes(q))
      .map((item) => ({
        title: item.name,
        subtitle: `${item.level} → ${item.targetLevel}`,
        kind: "Language",
        href: `/languages/${item.id}`,
      }));
    const words = workspace.languages.flatMap((language) =>
      getWordSet(language.id)
        .filter((word) =>
          `${word.term} ${word.meaning} ${word.translation}`
            .toLocaleLowerCase()
            .includes(q),
        )
        .map((word) => ({
          title: word.term,
          subtitle: `${language.name} · ${word.meaning}`,
          kind: "Vocabulary",
          href: `/languages/${language.id}`,
        })),
    );
    return [
      ...projects,
      ...matchingTasks,
      ...notes,
      ...languages,
      ...words,
    ].slice(0, 12);
  }, [q, workspace, tasks]);
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Enter" && q) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, q, query, router, onClose]);
  if (!open) return null;
  return (
    <Modal
      title="Search your workspace"
      description="Find a project, task, note, or language."
      onClose={onClose}
      size="search"
    >
      <div className="palette-input">
        <Search size={17} />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try ‘reply state’ or ‘German’"
          aria-label="Search workspace"
        />
        <kbd>↵</kbd>
      </div>
      {q ? (
        <div className="palette-results">
          {results.length ? (
            results.map((item, index) => (
              <button
                className="palette-result"
                key={`${item.kind}-${item.title}-${index}`}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
              >
                <span className="palette-result-icon">
                  <Code2 size={15} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </span>
                <em>{item.kind}</em>
                <ChevronRight size={14} />
              </button>
            ))
          ) : (
            <div className="palette-empty">
              No matches yet. Try another word.
            </div>
          )}
          {results.length > 0 && (
            <button
              className="palette-all"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                onClose();
              }}
            >
              See all matching results <ChevronRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="palette-hint">
          <kbd>/</kbd> anywhere to search{" "}
          <span>Projects · tasks · notes · languages</span>
        </div>
      )}
    </Modal>
  );
}

function NavigationLink({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`nav-link ${active ? "nav-link-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={17} strokeWidth={1.8} />
      <span>{item.label}</span>
      {item.label === "Languages" && item.count !== undefined && (
        <span className="nav-count">{item.count}</span>
      )}
    </Link>
  );
}

export default function WorkspaceFrame({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspace,
    actions,
    ready,
    session,
    authReady,
    cloudConfigured,
    syncStatus,
  } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const title = titleForPath(pathname);
  const streak = Math.max(
    0,
    ...workspace.languages.map((language) => getStreak(language.completedDays)),
  );
  const activeLanguageCount = workspace.languages.filter(
    (item) => item.enabled,
  ).length;
  const accountDestination = cloudConfigured ? "/signin" : "/settings";

  useEffect(() => {
    if (!cloudConfigured || !authReady) return;
    if (!session)
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
  }, [cloudConfigured, authReady, session, pathname, router]);

  useEffect(() => {
    const onKey = (event) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  if (!ready || (cloudConfigured && (!authReady || !session)))
    return (
      <div className="workspace-loading">
        <LoadingState
          label={
            cloudConfigured
              ? "Checking your account…"
              : "Opening your workspace…"
          }
        />
      </div>
    );

  const active = (href) =>
    pathname === href || (href !== "/today" && pathname.startsWith(`${href}/`));
  const syncText = !cloudConfigured
    ? "On this device"
    : syncStatus === "cloud"
      ? "Saved to cloud"
      : syncStatus === "syncing" || syncStatus === "connecting"
        ? "Syncing"
        : "Sync paused";
  const SyncIcon = !cloudConfigured
    ? CloudOff
    : syncStatus === "error"
      ? CloudOff
      : Cloud;

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <Link className="brand" href="/today">
          <span className="brand-mark">
            <span />
          </span>
          <span className="brand-name">devflow</span>
          <span className="brand-version">workspace</span>
        </Link>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <NavigationLink
              key={item.href}
              item={{ ...item, count: activeLanguageCount }}
              active={active(item.href)}
            />
          ))}
        </nav>
        <div className="sidebar-rule" />
        <NavigationLink
          item={{ label: "Settings", href: "/settings", icon: Settings2 }}
          active={active("/settings")}
        />
        <div className="sidebar-spacer" />
        <div className="sidebar-streak">
          <span className="streak-icon">
            <Flame size={15} />
          </span>
          <span>
            <strong>{streak} day streak</strong>
            <small>showed up to learn</small>
          </span>
          <span className="streak-dots">
            <i />
            <i />
            <i />
          </span>
        </div>
        <Link href={accountDestination} className="profile-link">
          <span className="profile-avatar">
            {workspace.profile.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="profile-copy">
            <strong>{workspace.profile.name}</strong>
            <small>
              {workspace.profile.isSample
                ? "Sample workspace"
                : "Personal workspace"}
            </small>
          </span>
          <ChevronRight size={15} />
        </Link>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="mobile-brand-mark">
              <span className="brand-mark">
                <span />
              </span>
            </span>
            <div className="breadcrumb">
              <span>DevFlow</span>
              <ChevronRight size={13} />
              <strong>{title}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={15} />
              <span>Search anything</span>
              <kbd>/</kbd>
            </button>
            <span
              className={`sync-label ${syncStatus === "error" ? "sync-error" : ""}`}
            >
              <SyncIcon size={14} />
              {syncText}
            </span>
            <IconButton
              label={
                workspace.settings.theme === "dark"
                  ? "Use light theme"
                  : "Use dark theme"
              }
              onClick={() =>
                actions.updateSettings({
                  theme: workspace.settings.theme === "dark" ? "light" : "dark",
                })
              }
            >
              {workspace.settings.theme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </IconButton>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          { label: "Today", href: "/today", icon: Home },
          { label: "Projects", href: "/projects", icon: FolderKanban },
          { label: "Focus", href: "/focus", icon: Timer },
          { label: "Languages", href: "/languages", icon: BookOpen },
        ].map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            active={active(item.href)}
          />
        ))}
        <button
          className={`nav-link mobile-more ${moreOpen ? "nav-link-active" : ""}`}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>
      {moreOpen && (
        <div className="mobile-more-sheet">
          <button className="sheet-close" onClick={() => setMoreOpen(false)}>
            <X size={16} /> Close
          </button>
          {moreNav.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
              active={active(item.href)}
              onClick={() => setMoreOpen(false)}
            />
          ))}
        </div>
      )}
      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
