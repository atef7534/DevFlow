export const initialWorkspace = {
  profile: {
    name: "Atif Yasser",
    githubUsername: "atef7534",
    isSample: true,
  },
  projects: [
    {
      id: "comments", name: "Interactive Comments Section", description: "A considered comments experience with threaded replies, editing, and voting.", technology: ["React", "CSS"], status: "In progress", color: "violet", repository: "atef7534/interactive-comments-section", deadline: "2026-10-08", createdAt: "2026-09-24",
      tasks: [
        { id: "comments-next", title: "Polish the reply state on mobile", description: "Check nested replies at narrow widths.", status: "In progress", priority: "High", tags: ["UI", "Mobile"], dueDate: "2026-10-02", createdAt: "2026-09-26" },
        { id: "comments-tests", title: "Cover edit and delete flows", status: "Todo", priority: "Medium", tags: ["Quality"], dueDate: "2026-10-04", createdAt: "2026-09-28" },
        { id: "comments-pages", title: "Review the deployment page", status: "Completed", priority: "Low", tags: ["Release"], createdAt: "2026-09-25", completedAt: "2026-09-27" },
      ],
    },
    {
      id: "translator", name: "AI Translator", description: "A small translation workspace for comparing useful language output.", technology: ["React", "API"], status: "In progress", color: "blue", repository: "", deadline: "2026-10-18", createdAt: "2026-09-18",
      tasks: [
        { id: "translator-api", title: "Map the translation response", status: "Todo", priority: "High", tags: ["API"], dueDate: "2026-10-06", createdAt: "2026-09-25" },
        { id: "translator-history", title: "Save recent translations", status: "Todo", priority: "Medium", tags: ["Storage"], createdAt: "2026-09-27" },
      ],
    },
    {
      id: "extensions", name: "Browser Extensions Manager", description: "A compact way to browse and manage installed extensions.", technology: ["React", "Vite"], status: "Completed", color: "green", repository: "", deadline: "", createdAt: "2026-09-11",
      tasks: [
        { id: "extensions-filters", title: "Add the category filters", status: "Completed", priority: "Medium", tags: ["UI"], createdAt: "2026-09-12", completedAt: "2026-09-16" },
        { id: "extensions-release", title: "Prepare the release notes", status: "Completed", priority: "Low", tags: ["Release"], createdAt: "2026-09-14", completedAt: "2026-09-17" },
      ],
    },
    {
      id: "devflow", name: "DevFlow", description: "One calm space for focused coding, learning, and keeping a record of progress.", technology: ["Next.js", "React", "Tailwind"], status: "In progress", color: "amber", repository: "atef7534/DevFlow", deadline: "2026-10-24", createdAt: "2026-09-30",
      tasks: [
        { id: "devflow-shell", title: "Set up the workspace shell", status: "Completed", priority: "High", tags: ["Foundation"], createdAt: "2026-09-29", completedAt: "2026-09-30" },
        { id: "devflow-language", title: "Build the daily vocabulary flow", status: "In progress", priority: "High", tags: ["Learning"], createdAt: "2026-09-30" },
        { id: "devflow-polish", title: "Refine responsive layouts", status: "Todo", priority: "Medium", tags: ["UI", "Mobile"], createdAt: "2026-09-30" },
      ],
    },
  ],
  notes: [
    { id: "note-use-effect", title: "React useEffect", content: "Effects synchronize a component with an external system. Keep render logic pure and make dependencies explicit.", tags: ["React", "Hooks"], projectId: "devflow", languageId: "", pinned: true, createdAt: "2026-09-27", updatedAt: "2026-09-29" },
    { id: "note-immutable", title: "Immutable state updates", content: "Use map when one item changes. Return every untouched item so React can compare references predictably.", tags: ["JavaScript", "State"], projectId: "", languageId: "", pinned: true, createdAt: "2026-09-26", updatedAt: "2026-09-26" },
    { id: "note-german", title: "German · practical phrases", content: "Ich kümmere mich darum. — I'll take care of it.\n\nDas hängt davon ab. — It depends.", tags: ["Vocabulary", "German"], projectId: "", languageId: "german", pinned: false, createdAt: "2026-09-25", updatedAt: "2026-09-28" },
    { id: "note-closures", title: "JavaScript closures", content: "A closure keeps access to its lexical environment even after the outer function returns.", tags: ["JavaScript"], projectId: "", languageId: "", pinned: false, createdAt: "2026-09-22", updatedAt: "2026-09-22" },
  ],
  languages: [
    { id: "german", name: "German", level: "A2", targetLevel: "B2", dailyWords: 5, enabled: true, startedAt: "2026-08-15", preferredTime: "20:00", difficulty: "Balanced", completedDays: ["2026-09-24", "2026-09-25", "2026-09-26", "2026-09-28", "2026-09-29", "2026-09-30"], isSample: true },
    { id: "english", name: "English", level: "B1", targetLevel: "C1", dailyWords: 5, enabled: true, startedAt: "2026-06-01", preferredTime: "09:00", difficulty: "Balanced", completedDays: ["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"], isSample: true },
  ],
  vocabularyProgress: {
    "de-erfahrung": { status: "Learning", saved: false, updatedAt: "2026-09-29" },
    "de-entwickeln": { status: "Mastered", saved: true, updatedAt: "2026-09-27" },
    "de-zuverlaessig": { status: "Review", saved: false, updatedAt: "2026-09-29", dueAt: "2026-09-30" },
    "en-refine": { status: "Learning", saved: true, updatedAt: "2026-09-29" },
    "en-reliable": { status: "Mastered", saved: false, updatedAt: "2026-09-27" },
  },
  dailySessions: {},
  focusSessions: [
    { id: "focus-1", projectId: "comments", taskId: "comments-next", category: "coding", minutes: 42, completed: true, date: "2026-09-29T15:20:00" },
    { id: "focus-2", projectId: "devflow", taskId: "devflow-shell", category: "coding", minutes: 25, completed: true, date: "2026-09-30T09:15:00" },
    { id: "focus-3", projectId: "translator", taskId: "", category: "language", minutes: 30, completed: true, date: "2026-09-28T16:00:00" },
    { id: "focus-4", projectId: "", taskId: "", category: "coding", minutes: 50, completed: true, date: "2026-09-26T11:30:00" },
  ],
  timer: { duration: 1500, remaining: 1500, status: "idle", projectId: "comments", taskId: "comments-next", category: "coding", startedAt: null },
  settings: { theme: "dark", reminders: true, dailyGoal: 5, learningTime: "20:00", weekStartsOn: "Monday" },
};
