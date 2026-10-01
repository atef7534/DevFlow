const API = "https://api.github.com";

async function getJson(path) {
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store",
  });
  if (!response.ok) {
    const error = new Error(response.status === 404 ? "That GitHub username wasn't found." : response.status === 403 ? "GitHub's public request limit was reached. Try again a little later." : `GitHub returned ${response.status}. Try again in a moment.`);
    error.status = response.status;
    error.remaining = response.headers.get("X-RateLimit-Remaining");
    throw error;
  }
  return response.json();
}

export async function getGitHubOverview(username) {
  const clean = String(username ?? "").trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(clean)) throw new Error("Enter a valid GitHub username to continue.");
  const [profileResult, repoResult, eventResult] = await Promise.allSettled([
    getJson(`/users/${encodeURIComponent(clean)}`),
    getJson(`/users/${encodeURIComponent(clean)}/repos?sort=updated&per_page=12&type=owner`),
    getJson(`/users/${encodeURIComponent(clean)}/events/public?per_page=10`),
  ]);
  if (profileResult.status === "rejected") throw profileResult.reason;
  const profile = profileResult.value;
  const repositories = repoResult.status === "fulfilled" ? repoResult.value : [];
  const events = eventResult.status === "fulfilled" ? eventResult.value : [];
  return {
    profile,
    repositories,
    events,
    warning: repoResult.status === "rejected" ? repoResult.reason.message : eventResult.status === "rejected" ? eventResult.reason.message : "",
    fetchedAt: new Date().toISOString(),
  };
}

export function summarizeEvent(event) {
  const repo = event.repo?.name?.split("/").at(-1) ?? "a repository";
  switch (event.type) {
    case "PushEvent": return { icon: "push", text: `Pushed changes to ${repo}`, detail: event.payload?.commits?.length ? `${event.payload.commits.length} commit${event.payload.commits.length === 1 ? "" : "s"}` : "Updated code" };
    case "PullRequestEvent": return { icon: "pull", text: `${event.payload?.action ?? "Updated"} a pull request in ${repo}`, detail: event.payload?.pull_request?.title ?? "Pull request" };
    case "IssuesEvent": return { icon: "issue", text: `${event.payload?.action ?? "Updated"} an issue in ${repo}`, detail: event.payload?.issue?.title ?? "Issue" };
    case "CreateEvent": return { icon: "create", text: `Created ${event.payload?.ref_type ?? "a branch"} in ${repo}`, detail: event.payload?.ref ?? "New work" };
    case "WatchEvent": return { icon: "star", text: `Starred ${repo}`, detail: "Repository" };
    default: return { icon: "activity", text: `Activity in ${repo}`, detail: event.type?.replace("Event", "") ?? "Public activity" };
  }
}
