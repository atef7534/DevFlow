"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  Code2,
  Download,
  ExternalLink,
  GitBranch,
  Globe2,
  LogOut,
  Moon,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { languageCatalog } from "@/data/languages";
import { formatDate, localDateKey } from "@/utils/dates";
import { getGitHubOverview, summarizeEvent } from "@/services/github";
import { isCloudConfigured, supabase } from "@/services/supabase";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  IconButton,
  Modal,
  PageHeading,
  ProgressBar,
} from "@/components/ui";
import { LanguageSettingsForm } from "@/components/workspace/Forms";

export function GitHubPage() {
  const { workspace, actions } = useWorkspace();
  const [username, setUsername] = useState(
    workspace.profile.githubUsername || "atef7534",
  );
  const [submitted, setSubmitted] = useState(
    workspace.profile.githubUsername || "atef7534",
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState("");

  const load = useCallback(
    async (value) => {
      setLoading(true);
      setError("");
      setWarning("");
      try {
        const overview = await getGitHubOverview(value);
        setData(overview);
        setSubmitted(value);
        setLastFetched(overview.fetchedAt);
        setWarning(overview.warning);
        actions.updateProfile({
          githubUsername: value.replace(/^@/, "").trim(),
        });
      } catch (caught) {
        setError(
          caught.message ||
            "GitHub couldn't be reached. Try again in a moment.",
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [actions],
  );
  useEffect(() => {
    if (submitted) load(submitted);
  }, []);

  const stars =
    data?.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0) ??
    0;
  const repoLanguages = [
    ...new Set(
      data?.repositories.map((repo) => repo.language).filter(Boolean) ?? [],
    ),
  ];
  return (
    <>
      <PageHeading
        eyebrow="PUBLIC WORK, ONE PLACE"
        title="GitHub"
        description="A small window into your public repositories and recent activity. No token needed."
      />
      <form
        className="github-search-row"
        onSubmit={(event) => {
          event.preventDefault();
          const cleaned = username.trim().replace(/^@/, "");
          setSubmitted(cleaned);
          load(cleaned);
        }}
      >
        <div className="github-input-wrap">
          <GitBranch size={16} />
          <input
            aria-label="GitHub username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="GitHub username"
          />
          <span>github.com/</span>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="button-spinner" /> Looking…
            </>
          ) : (
            <>
              <RefreshCw size={13} /> Load profile
            </>
          )}
        </Button>
      </form>
      {error && (
        <div className="github-error" role="alert">
          <AlertCircle size={17} />
          <div>
            <strong>We couldn't load that profile.</strong>
            <p>{error}</p>
            <button onClick={() => load(submitted)}>
              Try again <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
      {loading && !data && (
        <div className="github-loading">
          <span className="loading-dot" />
          <span>Looking up public profile and repositories…</span>
        </div>
      )}
      {warning && (
        <div className="github-warning">
          <AlertCircle size={14} />
          {warning}
        </div>
      )}
      {data && (
        <div className="github-overview">
          <section className="github-profile surface">
            <div className="github-profile-main">
              <img
                src={data.profile.avatar_url}
                alt={`${data.profile.login}'s public GitHub avatar`}
                className="github-avatar"
              />
              <div>
                <div className="github-name-line">
                  <h2>{data.profile.name || data.profile.login}</h2>
                  <a
                    href={data.profile.html_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open GitHub profile"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
                <a
                  className="github-handle"
                  href={data.profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{data.profile.login}
                </a>
                {data.profile.bio && <p>{data.profile.bio}</p>}
                <div className="github-profile-meta">
                  {data.profile.location && (
                    <span>
                      <Globe2 size={12} />
                      {data.profile.location}
                    </span>
                  )}
                  <span>
                    <Users size={12} />
                    {data.profile.followers.toLocaleString()} followers
                  </span>
                  <span>
                    Joined{" "}
                    {formatDate(data.profile.created_at, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="github-profile-stats">
              <div>
                <strong>{data.profile.public_repos}</strong>
                <small>public repos</small>
              </div>
              <div>
                <strong>
                  <Star size={14} />
                  {stars.toLocaleString()}
                </strong>
                <small>stars across loaded repos</small>
              </div>
              <div>
                <strong>{data.profile.following.toLocaleString()}</strong>
                <small>following</small>
              </div>
            </div>
            <div className="github-language-strip">
              <span>LANGUAGES IN RECENT REPOS</span>
              {repoLanguages.length ? (
                repoLanguages
                  .slice(0, 5)
                  .map((name) => <Badge key={name}>{name}</Badge>)
              ) : (
                <small>No language labels on recent repositories.</small>
              )}
            </div>
          </section>
          <div className="github-columns">
            <section className="surface github-repositories">
              <div className="section-title-row">
                <div>
                  <h2>Recently updated repositories</h2>
                  <p>Public projects, sorted by recent activity.</p>
                </div>
                <Badge>{data.repositories.length} shown</Badge>
              </div>
              {data.repositories.length ? (
                data.repositories.map((repo) => (
                  <a
                    className="github-repo-row"
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="repo-glyph">
                      <Code2 size={15} />
                    </span>
                    <span className="repo-details">
                      <strong>{repo.name}</strong>
                      <small>
                        {repo.description || "No description provided."}
                      </small>
                      <span className="repo-meta">
                        {repo.language && <i className="repo-language-dot" />}
                        {repo.language || "Other"} <span>·</span> Updated{" "}
                        {formatDate(repo.updated_at)}
                      </span>
                    </span>
                    <span className="repo-stars">
                      <Star size={12} />
                      {repo.stargazers_count}
                    </span>
                    <ArrowUpRight size={14} />
                  </a>
                ))
              ) : (
                <EmptyState
                  icon={Code2}
                  title="No public repositories yet"
                  description="When this account has public repositories, they will appear here."
                />
              )}
            </section>
            <section className="surface github-events">
              <div className="section-title-row">
                <div>
                  <h2>Recent public activity</h2>
                  <p>The latest events GitHub makes public.</p>
                </div>
                <ActivityIcon />
              </div>
              {data.events.length ? (
                data.events.slice(0, 8).map((event) => {
                  const summary = summarizeEvent(event);
                  return (
                    <div className="github-event-row" key={event.id}>
                      <span className={`event-marker ${summary.icon}`}>
                        <ActivityGlyph kind={summary.icon} />
                      </span>
                      <div>
                        <strong>{summary.text}</strong>
                        <small>{summary.detail}</small>
                        <span>
                          {formatDate(event.created_at, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="github-empty-activity">
                  <Globe2 size={16} />
                  <span>No public events were returned for this profile.</span>
                </div>
              )}
            </section>
          </div>
          <div className="github-footnote">
            <ShieldCheck size={14} />
            Public GitHub API data, refreshed{" "}
            {lastFetched
              ? formatDate(lastFetched, { hour: "numeric", minute: "2-digit" })
              : "just now"}
            . Unauthenticated activity is limited to public events; a private
            contribution graph isn't exposed by this endpoint.
          </div>
        </div>
      )}
      {!data && !loading && !error && (
        <EmptyState
          icon={GitBranch}
          title="Connect a public profile"
          description="Enter a GitHub username to see its public repositories and activity."
        />
      )}
    </>
  );
}

function ActivityIcon() {
  return <span className="activity-icon">↗</span>;
}
function ActivityGlyph({ kind }) {
  return (
    <span>
      {kind === "push"
        ? "↑"
        : kind === "pull"
          ? "⑂"
          : kind === "issue"
            ? "#"
            : kind === "star"
              ? "★"
              : "·"}
    </span>
  );
}

export function SettingsPage() {
  const { workspace, actions, cloudConfigured, session, syncStatus } =
    useWorkspace();
  const [name, setName] = useState(workspace.profile.name);
  const [username, setUsername] = useState(workspace.profile.githubUsername);
  const [saved, setSaved] = useState(false);
  const [languageEditor, setLanguageEditor] = useState(null);
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [busy, setBusy] = useState(false);

  const saveProfile = (event) => {
    event.preventDefault();
    actions.updateProfile({
      name: name.trim() || "Developer",
      githubUsername: username.trim().replace(/^@/, ""),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const exportData = () => {
    const payload = {
      app: "DevFlow",
      version: 2,
      exportedAt: new Date().toISOString(),
      workspace,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `devflow-${localDateKey()}-backup.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Workspace exported as JSON.");
  };
  const chooseImport = async (event) => {
    setError("");
    setNotice("");
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = parsed.workspace ?? parsed;
      if (!validImport(imported))
        throw new Error(
          "The file needs projects, notes, languages, focus sessions, and workspace settings to import.",
        );
      setCandidate(imported);
    } catch (caught) {
      setError(caught.message || "That file isn't valid DevFlow JSON.");
    }
  };
  const doSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.assign("/");
  };
  const deleteAccount = async () => {
    setBusy(true);
    setError("");
    try {
      const { error: deleteError } = await supabase.rpc("delete_own_account");
      if (deleteError) throw deleteError;
      await supabase.auth.signOut();
      window.location.assign("/");
    } catch (caught) {
      setError(caught.message || "The account could not be deleted.");
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="MAKE THE SPACE YOURS"
        title="Settings"
        description="A few preferences for how DevFlow fits the way you work and learn."
      />
      {notice && (
        <div className="settings-notice" role="status">
          <CheckCircle2 size={14} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}
      {error && (
        <div className="settings-notice error" role="alert">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {[
            ["Profile", "#profile"],
            ["Learning", "#learning"],
            ["Appearance", "#appearance"],
            ["Reminders", "#reminders"],
            ["Your data", "#data"],
            ["Account", "#account"],
          ].map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="settings-sections">
          <section className="settings-section" id="profile">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon">
                  <Users size={15} />
                </span>
              </span>
              <div>
                <h2>Profile</h2>
                <p>The details shown around your workspace.</p>
              </div>
            </div>
            <form className="settings-panel surface" onSubmit={saveProfile}>
              <label className="settings-avatar">
                <span>{(name || "D").slice(0, 1).toUpperCase()}</span>
                <small>
                  Personal workspace
                  <br />
                  {workspace.profile.isSample
                    ? "Sample profile · editable"
                    : "Saved in your workspace"}
                </small>
              </label>
              <div className="form-grid">
                <Field
                  label="Display name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={60}
                />
                <Field
                  label="GitHub username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  maxLength={39}
                  placeholder="atef7534"
                  hint="Used to look up public profile data."
                />
              </div>
              <div className="settings-panel-foot">
                <span>
                  {saved ? (
                    <>
                      <Check size={13} /> Changes saved
                    </>
                  ) : (
                    "Your display name is only used inside DevFlow."
                  )}
                </span>
                <Button size="sm" type="submit">
                  Save profile
                </Button>
              </div>
            </form>
          </section>

          <section className="settings-section" id="learning">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon amber">
                  <BookOpen size={15} />
                </span>
              </span>
              <div>
                <h2>Learning</h2>
                <p>Choose how each language fits into your day.</p>
              </div>
            </div>
            <div className="settings-panel surface settings-language-list">
              {workspace.languages.length ? (
                workspace.languages.map((language) => (
                  <div className="settings-language-row" key={language.id}>
                    <span className="language-mark">
                      {language.name.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{language.name}</strong>
                      <small>
                        {language.level} → {language.targetLevel} · self-set
                      </small>
                    </span>
                    <Badge tone={language.enabled ? "green" : "neutral"}>
                      {language.enabled
                        ? `${language.dailyWords} words / day`
                        : "Paused"}
                    </Badge>
                    <button
                      className="button button-quiet button-sm"
                      onClick={() => setLanguageEditor(language)}
                    >
                      Edit plan <ArrowRight size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="settings-empty">
                  No active language plans yet.{" "}
                  <Link href="/languages">
                    Choose a language <ArrowRight size={12} />
                  </Link>
                </div>
              )}
              <div className="settings-panel-foot">
                <span>Bundled word sets work without an API key.</span>
                <Link href="/languages" className="text-link">
                  Manage languages <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </section>

          <section className="settings-section" id="appearance">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon violet">
                  <Sun size={15} />
                </span>
              </span>
              <div>
                <h2>Appearance</h2>
                <p>Pick the surface that feels comfortable to work in.</p>
              </div>
            </div>
            <div className="settings-panel surface">
              <div className="theme-options">
                {[
                  ["dark", Moon, "Dark", "Warm charcoal"],
                  ["light", Sun, "Light", "Soft paper"],
                  ["system", Settings2, "System", "Follow this device"],
                ].map(([value, Icon, title, detail]) => (
                  <button
                    key={value}
                    className={`theme-choice ${workspace.settings.theme === value ? "chosen" : ""}`}
                    onClick={() => actions.updateSettings({ theme: value })}
                  >
                    <span className="theme-choice-icon">
                      <Icon size={16} />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </span>
                    <i>
                      {workspace.settings.theme === value && (
                        <Check size={11} />
                      )}
                    </i>
                  </button>
                ))}
              </div>
              <div className="settings-panel-foot">
                <span>Appearance preference is saved with your workspace.</span>
                <Badge>
                  {workspace.settings.theme === "system"
                    ? "System"
                    : workspace.settings.theme === "light"
                      ? "Light"
                      : "Dark"}
                </Badge>
              </div>
            </div>
          </section>

          <section className="settings-section" id="reminders">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon amber">
                  <Clock3 size={15} />
                </span>
              </span>
              <div>
                <h2>Reminders</h2>
                <p>Gentle in-app nudges, kept simple.</p>
              </div>
            </div>
            <div className="settings-panel surface reminder-panel">
              <label className="toggle-setting">
                <span>
                  <strong>Daily learning reminder</strong>
                  <small>
                    Show a reminder inside DevFlow when today's words are still
                    waiting.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={workspace.settings.reminders}
                  onChange={(event) =>
                    actions.updateSettings({ reminders: event.target.checked })
                  }
                />
                <i />
              </label>
              <div className="reminder-time-row">
                <span>Preferred time</span>
                <input
                  type="time"
                  value={workspace.settings.learningTime || "20:00"}
                  onChange={(event) =>
                    actions.updateSettings({ learningTime: event.target.value })
                  }
                />
              </div>
              <div className="settings-panel-foot">
                <span>
                  Reminders appear in the app. No email or push notifications
                  are sent.
                </span>
              </div>
            </div>
          </section>

          <section className="settings-section" id="data">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon green">
                  <Cloud size={15} />
                </span>
              </span>
              <div>
                <h2>Your data</h2>
                <p>Take it with you or start fresh.</p>
              </div>
            </div>
            <div className="settings-panel surface">
              <div className="data-status-row">
                <span
                  className={`data-mode-mark ${cloudConfigured ? "cloud" : "local"}`}
                >
                  {cloudConfigured ? (
                    <Cloud size={15} />
                  ) : (
                    <ShieldCheck size={15} />
                  )}
                </span>
                <span>
                  <strong>
                    {cloudConfigured
                      ? "Supabase cloud workspace"
                      : "Local workspace"}
                  </strong>
                  <small>
                    {cloudConfigured
                      ? `${session?.user?.email ?? "Signed in"} · ${syncStatus === "cloud" ? "Saved" : syncStatus}`
                      : "Saved in this browser only. No account or connection required."}
                  </small>
                </span>
                <Badge tone={cloudConfigured ? "blue" : "green"}>
                  {cloudConfigured ? "Cloud" : "On this device"}
                </Badge>
              </div>
              <div className="data-actions">
                <button onClick={exportData}>
                  <Download size={14} />
                  <span>
                    <strong>Export data</strong>
                    <small>Download a copy as JSON.</small>
                  </span>
                  <ArrowRight size={13} />
                </button>
                <label className="data-action-upload">
                  <Upload size={14} />
                  <span>
                    <strong>Import data</strong>
                    <small>
                      Validate a DevFlow JSON backup before replacing.
                    </small>
                  </span>
                  <ArrowRight size={13} />
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={chooseImport}
                  />
                </label>
                {!cloudConfigured && (
                  <button
                    className="data-action-danger"
                    onClick={() => setConfirm("clear")}
                  >
                    <Trash2 size={14} />
                    <span>
                      <strong>Clear local data</strong>
                      <small>
                        Remove projects, notes, learning, and sessions.
                      </small>
                    </span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="settings-section" id="account">
            <div className="settings-section-head">
              <span>
                <span className="settings-icon red">
                  <ShieldCheck size={15} />
                </span>
              </span>
              <div>
                <h2>Account</h2>
                <p>
                  {cloudConfigured
                    ? "Manage the account connected to this workspace."
                    : "Local workspaces do not use an account."}
                </p>
              </div>
            </div>
            <div className="settings-panel surface account-panel">
              {cloudConfigured && session ? (
                <>
                  <div className="account-identity">
                    <span className="profile-avatar">
                      {(session.user.email || "D").slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <strong>{session.user.email}</strong>
                      <small>Connected with Supabase Auth</small>
                    </span>
                    <Badge tone="green">Signed in</Badge>
                  </div>
                  <div className="account-actions">
                    <Button variant="secondary" onClick={doSignOut}>
                      <LogOut size={14} /> Sign out
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setConfirm("delete-account")}
                    >
                      <Trash2 size={14} /> Delete account
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="account-local">
                    <ShieldCheck size={16} />
                    <span>
                      <strong>You're using a local workspace.</strong>
                      <small>
                        Your data stays in this browser. Sign-in becomes
                        available when Supabase is configured.
                      </small>
                    </span>
                  </div>
                  <Link href="/signin" className="text-link">
                    Cloud account setup <ArrowRight size={12} />
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {languageEditor && (
        <LanguageSettingsForm
          language={languageEditor}
          onSave={(value) => {
            actions.updateLanguage(languageEditor.id, value);
            setLanguageEditor(null);
          }}
          onClose={() => setLanguageEditor(null)}
        />
      )}
      {confirm === "clear" && (
        <Modal
          title="Clear this local workspace?"
          description="Projects, tasks, notes, languages, saved words, and focus sessions on this device will be removed. This cannot be undone unless you exported a backup."
          onClose={() => setConfirm("")}
        >
          <div className="modal-actions">
            <Button variant="quiet" onClick={() => setConfirm("")}>
              Keep my data
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.clearLocalWorkspace();
                setConfirm("");
                setNotice("Local workspace data cleared.");
              }}
            >
              Clear local data
            </Button>
          </div>
        </Modal>
      )}
      {confirm === "delete-account" && (
        <Modal
          title="Delete your DevFlow account?"
          description="This permanently deletes your Supabase account and its cloud workspace snapshot. Export your data first if you may need it later."
          onClose={() => setConfirm("")}
        >
          <div className="modal-actions">
            <Button variant="quiet" onClick={() => setConfirm("")}>
              Keep account
            </Button>
            <Button variant="danger" disabled={busy} onClick={deleteAccount}>
              {busy ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </Modal>
      )}
      {candidate && (
        <Modal
          title="Import this workspace?"
          description="The backup passed validation. Importing replaces the workspace currently open on this account."
          onClose={() => setCandidate(null)}
        >
          <div className="import-preview">
            <span>
              <strong>{candidate.projects.length}</strong>
              <small>projects</small>
            </span>
            <span>
              <strong>{candidate.notes.length}</strong>
              <small>notes</small>
            </span>
            <span>
              <strong>{candidate.languages.length}</strong>
              <small>languages</small>
            </span>
            <span>
              <strong>{candidate.focusSessions.length}</strong>
              <small>sessions</small>
            </span>
          </div>
          <div className="modal-actions">
            <Button variant="quiet" onClick={() => setCandidate(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                try {
                  actions.importWorkspace(candidate);
                  setCandidate(null);
                  setNotice("Workspace imported.");
                } catch (caught) {
                  setError(caught.message);
                }
              }}
            >
              Replace workspace
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function validImport(value) {
  return Boolean(
    value &&
    value.profile &&
    Array.isArray(value.projects) &&
    value.projects.every(
      (project) =>
        project &&
        typeof project.name === "string" &&
        Array.isArray(project.tasks),
    ) &&
    Array.isArray(value.notes) &&
    value.notes.every(
      (note) =>
        note &&
        typeof note.title === "string" &&
        typeof note.content === "string",
    ) &&
    Array.isArray(value.languages) &&
    value.languages.every(
      (language) =>
        language &&
        typeof language.id === "string" &&
        typeof language.level === "string",
    ) &&
    Array.isArray(value.focusSessions) &&
    value.vocabularyProgress &&
    value.settings,
  );
}
