"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getDailyWordIds, languageCatalog } from "@/data/languages";
import { initialWorkspace } from "@/data/workspace";
import { dayOffsetKey, localDateKey } from "@/utils/dates";
import { isCloudConfigured, supabase } from "@/services/supabase";

const WorkspaceContext = createContext(null);
const LOCAL_KEY = "devflow.workspace.v2";
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const isWorkspace = (value) => Boolean(value && value.profile && Array.isArray(value.projects) && value.projects.every((item) => item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.tasks)) && Array.isArray(value.notes) && value.notes.every((item) => item && typeof item.title === "string" && typeof item.content === "string") && Array.isArray(value.languages) && value.languages.every((item) => item && typeof item.id === "string" && typeof item.level === "string") && value.vocabularyProgress && Array.isArray(value.focusSessions) && value.settings);

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!isCloudConfigured);
  const [loadedCloudUser, setLoadedCloudUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState(isCloudConfigured ? "connecting" : "local");
  const lastCloudSnapshot = useRef("");

  useEffect(() => {
    if (isCloudConfigured) { setReady(true); return; }
    try {
      const saved = JSON.parse(window.localStorage.getItem(LOCAL_KEY));
      if (isWorkspace(saved)) setWorkspace(saved);
    } catch { setWorkspace(initialWorkspace); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setAuthReady(true); }
    }).catch(() => {
      if (alive) { setAuthReady(true); setSyncStatus("error"); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadedCloudUser(null);
      if (!nextSession) { setWorkspace(initialWorkspace); setSyncStatus("connecting"); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready || !session?.user?.id || !supabase) return;
    const userId = session.user.id;
    let cancelled = false;
    setSyncStatus("syncing");
    supabase.from("workspace_snapshots").select("data").eq("user_id", userId).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setSyncStatus("error"); setLoadedCloudUser(userId); return; }
        if (isWorkspace(data?.data)) setWorkspace(data.data);
        else if (session.user.user_metadata?.full_name) {
          setWorkspace((current) => ({ ...current, profile: { ...current.profile, name: session.user.user_metadata.full_name, isSample: false } }));
        }
        setLoadedCloudUser(userId);
        setSyncStatus("cloud");
      });
    return () => { cancelled = true; };
  }, [ready, session?.user?.id]);

  useEffect(() => {
    if (!ready || isCloudConfigured) return;
    try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(workspace)); } catch { /* The workspace remains usable if storage is full. */ }
  }, [ready, workspace]);

  useEffect(() => {
    if (!ready || !session?.user?.id || loadedCloudUser !== session.user.id || !supabase) return;
    const userId = session.user.id;
    const timerSnapshot = workspace.timer.status === "running"
      ? { ...workspace.timer, status: "idle", remaining: workspace.timer.duration, startedAt: null }
      : workspace.timer;
    const snapshot = { ...workspace, timer: timerSnapshot };
    const snapshotText = JSON.stringify(snapshot);
    if (snapshotText === lastCloudSnapshot.current) return;
    const timeout = window.setTimeout(async () => {
      setSyncStatus("syncing");
      const { error } = await supabase.from("workspace_snapshots").upsert(
        { user_id: userId, data: snapshot, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
      lastCloudSnapshot.current = error ? "" : snapshotText;
      setSyncStatus(error ? "error" : "cloud");
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [JSON.stringify({ ...workspace, timer: workspace.timer.status === "running" ? { ...workspace.timer, status: "idle", remaining: workspace.timer.duration, startedAt: null } : workspace.timer }), ready, session?.user?.id, loadedCloudUser]);

  useEffect(() => {
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    };
    if (workspace.settings?.theme !== "system") {
      applyTheme(workspace.settings?.theme === "light" ? "light" : "dark");
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystem = (event) => applyTheme(event.matches ? "dark" : "light");
    applySystem(media);
    media.addEventListener("change", applySystem);
    return () => media.removeEventListener("change", applySystem);
  }, [workspace.settings?.theme]);

  useEffect(() => {
    if (!ready) return;
    const date = localDateKey();
    setWorkspace((current) => {
      let changed = false;
      const dailySessions = { ...current.dailySessions };
      for (const language of current.languages.filter((item) => item.enabled)) {
        const key = `${date}:${language.id}`;
        const wordIds = getDailyWordIds(language, date);
        const previous = dailySessions[key];
        if (!previous || JSON.stringify(previous.wordIds) !== JSON.stringify(wordIds)) {
          const answers = Object.fromEntries(
            wordIds
              .filter((wordId) => previous?.answers?.[wordId])
              .map((wordId) => [wordId, previous.answers[wordId]]),
          );
          dailySessions[key] = { date, languageId: language.id, wordIds, answers };
          changed = true;
        }
      }
      return changed ? { ...current, dailySessions } : current;
    });
  }, [ready, workspace.languages]);

  useEffect(() => {
    if (workspace.timer.status !== "running") return;
    const interval = window.setInterval(() => {
      setWorkspace((current) => {
        const timer = current.timer;
        if (timer.status !== "running") return current;
        if (timer.remaining <= 1) {
          const project = current.projects.find((item) => item.id === timer.projectId);
          const task = project?.tasks.find((item) => item.id === timer.taskId);
          const record = { id: makeId(), projectId: timer.projectId, taskId: timer.taskId, category: timer.category, minutes: Math.max(1, Math.round(timer.duration / 60)), completed: true, date: new Date().toISOString() };
          return { ...current, timer: { ...timer, status: "finished", remaining: 0, startedAt: null, finishedLabel: `${project?.name ?? "Independent work"}${task ? ` · ${task.title}` : ""}` }, focusSessions: [record, ...current.focusSessions] };
        }
        return { ...current, timer: { ...timer, remaining: timer.remaining - 1 } };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [workspace.timer.status]);

  const actions = useMemo(() => ({
    createProject(input) {
      const project = { ...input, id: makeId(), createdAt: localDateKey(), tasks: [] };
      setWorkspace((current) => ({ ...current, projects: [project, ...current.projects], profile: { ...current.profile, isSample: false } }));
      return project.id;
    },
    updateProject(projectId, changes) {
      setWorkspace((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, ...changes } : project) }));
    },
    deleteProject(projectId) {
      setWorkspace((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== projectId), notes: current.notes.map((note) => note.projectId === projectId ? { ...note, projectId: "" } : note), timer: current.timer.projectId === projectId ? { ...current.timer, projectId: "", taskId: "" } : current.timer }));
    },
    createTask(projectId, input) {
      const task = { ...input, id: makeId(), createdAt: localDateKey(), status: input.status || "Todo" };
      setWorkspace((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, tasks: [task, ...project.tasks] } : project) }));
      return task.id;
    },
    updateTask(taskId, changes) {
      setWorkspace((current) => {
        const source = current.projects.find((project) => project.tasks.some((task) => task.id === taskId));
        if (!source) return current;
        const previous = source.tasks.find((task) => task.id === taskId);
        const targetId = changes.projectId ?? source.id;
        const target = current.projects.find((project) => project.id === targetId);
        if (!target) return current;
        const { projectId: _projectId, ...fields } = changes;
        const updated = { ...previous, ...fields };
        return { ...current, projects: current.projects.map((project) => {
          if (project.id === source.id && project.id === target.id) return { ...project, tasks: project.tasks.map((task) => task.id === taskId ? updated : task) };
          if (project.id === source.id) return { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) };
          if (project.id === target.id) return { ...project, tasks: [updated, ...project.tasks] };
          return project;
        }) };
      });
    },
    toggleTask(taskId) {
      setWorkspace((current) => ({ ...current, projects: current.projects.map((project) => ({ ...project, tasks: project.tasks.map((task) => task.id === taskId ? { ...task, status: task.status === "Completed" ? "Todo" : "Completed", completedAt: task.status === "Completed" ? "" : localDateKey() } : task) })) }));
    },
    deleteTask(taskId) {
      setWorkspace((current) => ({ ...current, projects: current.projects.map((project) => ({ ...project, tasks: project.tasks.filter((task) => task.id !== taskId) })) }));
    },
    saveNote(note) {
      setWorkspace((current) => {
        const existing = current.notes.some((item) => item.id === note.id);
        const value = { ...note, updatedAt: localDateKey(), createdAt: note.createdAt || localDateKey() };
        return { ...current, notes: existing ? current.notes.map((item) => item.id === note.id ? value : item) : [{ ...value, id: makeId() }, ...current.notes] };
      });
    },
    deleteNote(noteId) { setWorkspace((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== noteId) })); },
    toggleNotePinned(noteId) { setWorkspace((current) => ({ ...current, notes: current.notes.map((note) => note.id === noteId ? { ...note, pinned: !note.pinned } : note) })); },
    ensureDailySession(languageId) {
      setWorkspace((current) => {
        const language = current.languages.find((item) => item.id === languageId);
        if (!language) return current;
        const date = localDateKey();
        const key = `${date}:${languageId}`;
        const wordIds = getDailyWordIds(language, date);
        const previous = current.dailySessions[key];
        if (previous && JSON.stringify(previous.wordIds) === JSON.stringify(wordIds)) return current;
        const answers = Object.fromEntries(
          wordIds
            .filter((wordId) => previous?.answers?.[wordId])
            .map((wordId) => [wordId, previous.answers[wordId]]),
        );
        return { ...current, dailySessions: { ...current.dailySessions, [key]: { date, languageId, wordIds, answers } } };
      });
    },
    answerVocabulary(languageId, wordId, answer) {
      setWorkspace((current) => {
        const date = localDateKey();
        const sessionKey = `${date}:${languageId}`;
        const language = current.languages.find((item) => item.id === languageId);
        const daily = current.dailySessions[sessionKey] ?? { date, languageId, wordIds: getDailyWordIds(language ?? { id: languageId, level: "A1", dailyWords: 5 }, date), answers: {} };
        const previous = current.vocabularyProgress[wordId] ?? {};
        let status = previous.status ?? "New";
        if (answer === "known") status = status === "Learning" || status === "Review" ? "Mastered" : "Learning";
        if (answer === "difficult") status = "Review";
        if (answer === "later" && status === "New") status = "Learning";
        const answers = { ...daily.answers, [wordId]: answer };
        const completed = daily.wordIds.every((word) => answers[word]);
        const completedDays = language?.completedDays ?? [];
        const languages = completed && language && !completedDays.includes(date)
          ? current.languages.map((item) => item.id === languageId ? { ...item, completedDays: [...item.completedDays, date] } : item)
          : current.languages;
        return {
          ...current,
          languages,
          vocabularyProgress: { ...current.vocabularyProgress, [wordId]: { ...previous, status, saved: previous.saved ?? false, updatedAt: date, dueAt: answer === "difficult" || answer === "later" ? dayOffsetKey(1) : previous.dueAt } },
          dailySessions: { ...current.dailySessions, [sessionKey]: { ...daily, answers } },
        };
      });
    },
    toggleVocabularySaved(wordId) {
      setWorkspace((current) => { const previous = current.vocabularyProgress[wordId] ?? {}; return { ...current, vocabularyProgress: { ...current.vocabularyProgress, [wordId]: { ...previous, saved: !previous.saved, status: previous.status ?? "New", updatedAt: localDateKey() } } }; });
    },
    saveVocabularyNote(wordId, note) {
      setWorkspace((current) => { const previous = current.vocabularyProgress[wordId] ?? {}; return { ...current, vocabularyProgress: { ...current.vocabularyProgress, [wordId]: { ...previous, status: previous.status ?? "New", note, updatedAt: localDateKey() } } }; });
    },
    addLanguage(languageId, level, targetLevel) {
      const catalog = languageCatalog.find((item) => item.id === languageId);
      if (!catalog) return;
      setWorkspace((current) => current.languages.some((item) => item.id === languageId) ? current : {
        ...current,
        languages: [...current.languages, { id: catalog.id, name: catalog.name, level, targetLevel, dailyWords: 5, enabled: true, startedAt: localDateKey(), preferredTime: "20:00", difficulty: "Balanced", completedDays: [], isSample: false }],
      });
    },
    updateLanguage(languageId, changes) { setWorkspace((current) => ({ ...current, languages: current.languages.map((language) => language.id === languageId ? { ...language, ...changes, isSample: false } : language) })); },
    removeLanguage(languageId) { setWorkspace((current) => ({ ...current, languages: current.languages.filter((language) => language.id !== languageId), notes: current.notes.map((note) => note.languageId === languageId ? { ...note, languageId: "" } : note) })); },
    setTimer(changes) { setWorkspace((current) => ({ ...current, timer: { ...current.timer, ...changes } })); },
    setTimerMinutes(minutes) { setWorkspace((current) => ({ ...current, timer: { ...current.timer, duration: minutes * 60, remaining: minutes * 60, status: "idle", startedAt: null } })); },
    resetTimer() { setWorkspace((current) => ({ ...current, timer: { ...current.timer, remaining: current.timer.duration, status: "idle", startedAt: null } })); },
    startTimer() { setWorkspace((current) => ({ ...current, timer: { ...current.timer, remaining: current.timer.status === "finished" ? current.timer.duration : current.timer.remaining, status: "running", startedAt: new Date().toISOString() } })); },
    pauseTimer() { setWorkspace((current) => ({ ...current, timer: { ...current.timer, status: "paused" } })); },
    finishTimer() {
      setWorkspace((current) => {
        if (current.timer.status === "finished") return { ...current, timer: { ...current.timer, status: "idle", remaining: current.timer.duration } };
        const elapsedSeconds = current.timer.duration - current.timer.remaining;
        const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
        const record = elapsedSeconds > 0 ? { id: makeId(), projectId: current.timer.projectId, taskId: current.timer.taskId, category: current.timer.category, minutes, completed: false, date: new Date().toISOString() } : null;
        return { ...current, timer: { ...current.timer, status: "idle", remaining: current.timer.duration, startedAt: null }, focusSessions: record ? [record, ...current.focusSessions] : current.focusSessions };
      });
    },
    saveFocusSession(input) { setWorkspace((current) => ({ ...current, focusSessions: [{ ...input, id: makeId(), date: new Date().toISOString() }, ...current.focusSessions] })); },
    updateProfile(changes) { setWorkspace((current) => ({ ...current, profile: { ...current.profile, ...changes, isSample: false } })); },
    updateSettings(changes) { setWorkspace((current) => ({ ...current, settings: { ...current.settings, ...changes } })); },
    importWorkspace(data) { if (!isWorkspace(data)) throw new Error("That file is missing a valid DevFlow workspace."); setWorkspace(data); },
    resetWorkspace() { setWorkspace(initialWorkspace); },
    clearLocalWorkspace() {
      const cleared = { ...initialWorkspace, profile: { ...initialWorkspace.profile, isSample: false }, projects: [], notes: [], languages: [], vocabularyProgress: {}, dailySessions: {}, focusSessions: [], timer: { ...initialWorkspace.timer, remaining: initialWorkspace.timer.duration, status: "idle" } };
      try { window.localStorage.removeItem(LOCAL_KEY); } catch { /* The in-memory workspace is still cleared. */ }
      setWorkspace(cleared);
    },
  }), []);

  const value = useMemo(() => ({ workspace, setWorkspace, actions, ready, session, authReady, cloudConfigured: isCloudConfigured, syncStatus }), [workspace, actions, ready, session, authReady, syncStatus]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
