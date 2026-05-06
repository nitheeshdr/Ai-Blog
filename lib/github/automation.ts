// ============================================================
// GITHUB AUTOMATION — Create branches, PRs, commits
// ============================================================

const GITHUB_API = "https://api.github.com";
const OWNER = process.env.GITHUB_REPO_OWNER ?? "nitheeshdr";
const REPO = process.env.GITHUB_REPO_NAME ?? "Ai-Blog";
const DEFAULT_BRANCH = process.env.GITHUB_DEFAULT_BRANCH ?? "main";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
};

async function ghFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API ${path}: ${res.status} ${err}`);
  }
  return res.json();
}

// ── Get latest commit SHA ──────────────────────────────────
async function getLatestCommitSHA(): Promise<string> {
  const data = await ghFetch(
    `/repos/${OWNER}/${REPO}/git/ref/heads/${DEFAULT_BRANCH}`
  );
  return data.object.sha;
}

// ── Create branch ──────────────────────────────────────────
export async function createBranch(branchName: string): Promise<void> {
  const sha = await getLatestCommitSHA();
  await ghFetch(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
  });
}

// ── Delete branch ──────────────────────────────────────────
export async function deleteBranch(branchName: string): Promise<void> {
  await ghFetch(`/repos/${OWNER}/${REPO}/git/refs/heads/${branchName}`, {
    method: "DELETE",
  });
}

// ── Create or update a file ────────────────────────────────
export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  branch: string
): Promise<void> {
  // Check if file exists to get its SHA
  let sha: string | undefined;
  try {
    const existing = await ghFetch(
      `/repos/${OWNER}/${REPO}/contents/${path}?ref=${branch}`
    );
    sha = existing.sha;
  } catch {
    // File doesn't exist — that's fine
  }

  await ghFetch(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

// ── Open Pull Request ──────────────────────────────────────
export async function openPullRequest(
  title: string,
  body: string,
  head: string,
  base: string = DEFAULT_BRANCH
): Promise<{ number: number; html_url: string }> {
  const data = await ghFetch(`/repos/${OWNER}/${REPO}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base }),
  });
  return { number: data.number, html_url: data.html_url };
}

// ── Merge Pull Request ─────────────────────────────────────
export async function mergePullRequest(
  prNumber: number,
  commitMessage?: string
): Promise<void> {
  if (process.env.AUTO_MERGE !== "true") {
    console.log(`Auto-merge disabled. PR #${prNumber} ready for review.`);
    return;
  }

  await ghFetch(`/repos/${OWNER}/${REPO}/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: JSON.stringify({
      commit_title: commitMessage ?? `Merge PR #${prNumber}`,
      merge_method: "squash",
    }),
  });
}

// ── Full Feature Workflow ──────────────────────────────────
export async function runFeatureWorkflow(options: {
  featureName: string;
  branchPrefix?: string;
  files: Array<{ path: string; content: string }>;
  prTitle: string;
  prBody: string;
}): Promise<{ branch: string; prNumber: number; prUrl: string }> {
  const { featureName, branchPrefix = "feature", files, prTitle, prBody } =
    options;

  // Sanitize branch name
  const slug = featureName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const branch = `${branchPrefix}/${slug}`;

  console.log(`[GitHub] Creating branch: ${branch}`);
  await createBranch(branch);

  // Commit all files
  for (const file of files) {
    await createOrUpdateFile(
      file.path,
      file.content,
      `feat: ${featureName} — ${file.path}`,
      branch
    );
  }

  // Open PR
  const pr = await openPullRequest(prTitle, prBody, branch);
  console.log(`[GitHub] PR #${pr.number} opened: ${pr.html_url}`);

  // Auto-merge if enabled
  await mergePullRequest(pr.number, `feat: ${featureName}`);

  return { branch, prNumber: pr.number, prUrl: pr.html_url };
}
