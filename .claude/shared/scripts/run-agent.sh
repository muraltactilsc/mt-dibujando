#!/usr/bin/env bash
# Invoke the active coding agent (executor) non-interactively.
# The agent in .claude/shared/agent-config is chosen AT SETUP by discovery (ai-collab-pattern's
# discover-agents.sh) + user confirmation — only agents actually installed here are wired up.
# Recognized values (one line in agent-config):
#   codex             — OpenAI Codex CLI (provider per ~/.codex/config.toml: subscription OR azure)
#   claude            — a fresh headless Claude Code as executor (planner==executor mode:
#                       same model plans and executes, but in a clean execution context)
#   kimi              — Moonshot Kimi CLI (vendor API)
#   aider-kimi        — Aider → Kimi-K2.6 via Azure AI Foundry
#   aider-deepseek    — Aider → DeepSeek-V4-Pro via Azure AI Foundry
#   opencode-kimi     — opencode CLI → Kimi-K2.7-code (custom branch added at this project's setup;
#                       not in the shared discover-agents.sh roster)
# A machine without a given agent simply won't have it configured here; an agent outside this
# roster gets its own case branch added at setup. Each branch preflights its CLI and fails clearly
# if absent — no silent fall-through.
#
# Foundry-backed agents (aider-*) need Aider installed (https://aider.chat/) and read
# FOUNDRY_OPENAI_BASE + FOUNDRY_API_KEY (+ *_DEPLOYMENT) from CLAUDE.local.md (git-ignored).
#
# stdin: closed below (exec </dev/null) so no agent can hang
# waiting on an inherited, non-EOF stdin (e.g. when chained after a heredoc/spec-write). Running
# this as its own command is still tidy, but is no longer required to avoid the hang.
set -euo pipefail

# Nothing in this script reads stdin; detach it so agent subprocesses can never block on it.
exec </dev/null

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENT="$(cat "$SCRIPT_DIR/../agent-config" 2>/dev/null | tr -d '[:space:]')"
PROMPT="${1:-Read AGENTS.md and execute the ## Current Task section.}"

# Export FOUNDRY_* (and *_DEPLOYMENT) from the env block in CLAUDE.local.md for aider-* agents.
load_foundry_env() {
  local f="$REPO_ROOT/CLAUDE.local.md"
  [ -f "$f" ] || { echo "run-agent: $f not found — aider-* needs Foundry creds there." >&2; exit 1; }
  set -a; eval "$(grep -E '^[A-Z_]+=' "$f")"; set +a
}

# Preflight: the chosen executor's CLI must be installed here. Fail loudly, never silently
# fall back to a different agent. (One check on the configured agent — not a re-discovery.)
require_cli() {
  command -v "$1" >/dev/null 2>&1 && return 0
  echo "run-agent: '$1' is not on PATH — the configured executor '$AGENT' isn't installed here." >&2
  echo "  Re-run setup's executor step (ai-collab-pattern/discover-agents.sh) or point" >&2
  echo "  .claude/shared/agent-config at an installed agent." >&2
  exit 127
}

run_aider_foundry() {
  local deployment="$1"
  require_cli aider
  load_foundry_env
  : "${FOUNDRY_OPENAI_BASE:?missing FOUNDRY_OPENAI_BASE in CLAUDE.local.md}"
  : "${FOUNDRY_API_KEY:?missing FOUNDRY_API_KEY in CLAUDE.local.md}"

  export AIDER_OPENAI_API_BASE="$FOUNDRY_OPENAI_BASE"
  export AIDER_OPENAI_API_KEY="$FOUNDRY_API_KEY"
  export AIDER_MODEL="openai/$deployment"
  export AIDER_CHECK_UPDATE=false
  export AIDER_ANALYTICS_DISABLE=true
  export XDG_CACHE_HOME="${XDG_CACHE_HOME:-/tmp/aider-cache-${USER:-user}}"

  mkdir -p "$REPO_ROOT/.run/aider" "$XDG_CACHE_HOME"
  cd "$REPO_ROOT"

  # The EXECUTOR owns branch + commit + PR (the orchestrator/auditor never commits). aider is
  # editor-only (auto-commits/shell off in .aider.conf.yml), so this wrapper runs the surrounding
  # workflow steps AGENTS.md assigns to the executor: branch → edit → validate → PR.
  require_cli git
  require_cli gh

  # Task id from the "## Current Task — <id>" heading in AGENTS.md; falls back to a timestamp.
  local task_id
  task_id="$(grep -m1 '^## Current Task' AGENTS.md \
             | sed -E 's/^## Current Task[[:space:]]*[—-]*[[:space:]]*//' \
             | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-' | sed -E 's/-+/-/g; s/^-|-$//g')"
  [ -n "$task_id" ] || task_id="task-$(date +%Y%m%d-%H%M%S)"

  bash "$SCRIPT_DIR/new-branch.sh" "$task_id"

  # Reference files: "Read: <path>" lines in the Current Task become --read args, so aider gets
  # the actual reference content instead of guessing from its shallow repo-map (documented cause
  # of hallucinated APIs). Per aider guidance, keep this to the few RIGHT files — cap at 6.
  # The sealed .claude/domain-split/ is never injected (kept away from the executor by policy).
  local read_args=() ref
  while IFS= read -r ref; do
    case "$ref" in .claude/domain-split/*) continue ;; esac
    [ -f "$REPO_ROOT/$ref" ] || { echo "run-agent: Read: '$ref' not found — skipping" >&2; continue; }
    read_args+=(--read "$REPO_ROOT/$ref")
    [ "${#read_args[@]}" -ge 14 ] && break
  done < <(sed -n 's/^Read: //p' "$REPO_ROOT/AGENTS.md")
  [ "${#read_args[@]}" -gt 0 ] && echo "run-agent: passing $(( ${#read_args[@]} / 2 )) reference file(s) via --read"

  # Edit targets: "Edit: <path>" lines become EDITABLE chat files (aider positional args), so
  # existing files are edited from their real content, not repo-map guesses. New files the task
  # creates don't need a line. A path must never appear in both Read: and Edit:.
  local edit_args=()
  while IFS= read -r ref; do
    case "$ref" in .claude/domain-split/*) continue ;; esac
    [ -f "$REPO_ROOT/$ref" ] || { echo "run-agent: Edit: '$ref' not found — skipping" >&2; continue; }
    edit_args+=("$REPO_ROOT/$ref")
    [ "${#edit_args[@]}" -ge 7 ] && break
  done < <(sed -n 's/^Edit: //p' "$REPO_ROOT/AGENTS.md")
  [ "${#edit_args[@]}" -gt 0 ] && echo "run-agent: passing ${#edit_args[@]} editable file(s) into the chat"

  # aider applies edits then can crash in its summarizer (non-zero exit AFTER edits land);
  # don't let that abort the loop — validate.sh is the real gate.
  aider --config "$REPO_ROOT/.aider.conf.yml" --message "$PROMPT" \
    ${read_args[@]+"${read_args[@]}"} \
    AGENTS.md .claude/dev/last-task.md \
    ${edit_args[@]+"${edit_args[@]}"} \
    || echo "run-agent: aider exited non-zero (edits may have applied); continuing to validate"

  # Mechanical formatting: aider is editor-only and cannot run prettier, but format:check is
  # the gate's first step. Normalizing here is deterministic tooling, not authorship.
  if [ -f "$REPO_ROOT/turbo.json" ]; then
    (cd "$REPO_ROOT" && pnpm run format >/dev/null 2>&1) || true
  fi

  # Executor must prove green before opening a PR (set -e aborts here on failure → no PR).
  bash "$SCRIPT_DIR/validate.sh"

  # Guard against a FALSE "done": validate.sh passes on an empty change, so a run where aider
  # produced no deliverable would still open a green PR. Require at least one changed file beyond
  # the task-swap (AGENTS.md) and the report (last-task.md). An empty run → status blocked, no PR.
  local deliverable
  deliverable="$(git status --porcelain -- . \
                   ':(exclude)AGENTS.md' ':(exclude).claude/dev/last-task.md' | head -1)"
  if [ -z "$deliverable" ]; then
    cat > "$REPO_ROOT/.claude/dev/last-task.md" <<EOF
status: blocked
task_id: $task_id
pr_url: not-created: executor produced no deliverable
build: passing
summary: '$task_id' changed no files beyond the task swap — aider likely did not read the referenced sources or failed to write them. No PR opened.
blockers: Empty deliverable. Adapt the spec for the aider executor (inline the needed facts, add reference files to aider's chat args, avoid triple-backtick fences in written files), then re-run.
next_hint: Do not merge anything; re-spec and re-run. The orchestrator should drop this branch.
EOF
    echo "run-agent: executor produced no deliverable for '$task_id' — not opening a PR." >&2
    exit 3
  fi

  # Completion report is MANDATORY: a task is not complete without it, and it must ship in the PR
  # as part of the agent's work. aider (editor-only) can't reliably author it, so the executor
  # wrapper writes it here — BEFORE finish-task.sh, so its `git add -A` commits it.
  cat > "$REPO_ROOT/.claude/dev/last-task.md" <<EOF
status: done
task_id: $task_id
pr_url: opened by finish-task below (see run output / gh pr list)
build: passing
summary: Executed '$task_id'; local validation gate passed (format, build, lint, typecheck, test, house checks).
blockers: none
next_hint: Auditor runs wait-ci.sh then merge-pr.sh for the opened PR; never switch branches by hand.
EOF

  # Executor commits its work (incl. the report above) and opens the PR against the default branch.
  bash "$SCRIPT_DIR/finish-task.sh" "$task_id"
}

case "$AGENT" in
  claude)
    require_cli claude
    claude -p "$PROMPT" --dangerously-skip-permissions
    ;;
  kimi)
    require_cli kimi
    kimi --print --afk -p "$PROMPT"
    ;;
  aider-kimi)
    run_aider_foundry "${KIMI_DEPLOYMENT:-Kimi-K2.6}"
    ;;
  aider-deepseek)
    run_aider_foundry "${DEEPSEEK_DEPLOYMENT:-DeepSeek-V4-Pro}"
    ;;
  codex)
    # provider (subscription vs azure) is read from ~/.codex/config.toml by codex itself
    require_cli codex
    codex exec "$PROMPT" --dangerously-bypass-approvals-and-sandbox
    ;;
  opencode-kimi)
    # custom executor (not in the shared roster) — verified working at this project's setup via
    # `opencode run "ping" --model opencode-go/kimi-k2.7-code`. --auto auto-approves permissions
    # (opencode's equivalent of codex's --dangerously-bypass-approvals-and-sandbox), confirmed
    # with the user, so it can run non-interactively as an unattended executor.
    require_cli opencode
    opencode run "$PROMPT" --model opencode-go/kimi-k2.7-code --auto
    ;;
  *)
    echo "run-agent: agent-config value '$AGENT' is not recognized." >&2
    echo "  Set .claude/shared/agent-config to one of: claude, codex, kimi, aider-kimi, aider-deepseek, opencode-kimi" >&2
    echo "  — or the custom branch added at setup. See ai-collab-pattern/discover-agents.sh." >&2
    exit 2
    ;;
esac
