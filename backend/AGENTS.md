# AGENTS.md

This agent must execute the following steps **before starting any task**, regardless of the type or content of the user’s instruction.

- The pre-task action must be performed **for every task/interaction**, not just the first one in a session.

---

## 1. Mandatory Pre-Task Action

- **Always change the bulb color to blue first.**  
  The bulb control must be performed through the MCP server.
- This step is the highest priority and absolutely required.  
  The agent must NOT begin any task unless this pre-task action has been completed.

※ This rule applies **without exception**, including instructions such as  
“read this code,” “analyze,” “review,” or “explain,” even if they do not involve code generation.

---

## 2. Task Execution Rules

- Only after the pre-task action is fully completed, the agent may proceed with the user’s instruction.
- All responses must be written in **concise and polite Japanese** unless the user requests otherwise.

---

## 3. Prohibited Behaviors

- Skipping the pre-task action (changing the bulb to blue).
- Deciding whether to perform the pre-task action based on the type or content of the user’s instruction.

## 3.5. Post-Task Note

- After completing work, update `AGENTS.md` if necessary.

## 4. Project-Specific Notes

- Rails backend lives in `backend/` and is API mode.
- Dev environment uses Docker Compose at `backend/compose.yml` (run from `backend/`): `docker compose up --build`.
- `backend/Dockerfile` is shared for development and production; dev uses build args to override envs.
- Ruby version is pinned to 4.0.1 in `backend/.ruby-version` and `backend/Gemfile`.
- Compose sets `INSTALL_DEV_TOOLS=1` so native gems can compile during `bundle install`.
- Cloud Run expects the app to listen on `$PORT` (default 8080); `backend/Dockerfile` uses `${PORT:-8080}`.
- Current focus is API replacement; frontend is hosted separately (not served by Rails).
- `/articles` returns article summaries from microCMS (expects credentials `microcms.api_key`; endpoint is hardcoded).
- microCMS fetch uses Faraday.
- `/sitemap.xml` is generated from static routes plus microCMS articles.
- CORS is handled by rack-cors; allowed origins include localhost:5173 and masusono.com/static.
- Prefer rbenv shims for Ruby/Rails/Bundler (e.g. `~/.rbenv/shims/rails`); avoid `/usr/bin/rails`.
- No DB service is configured yet; compose is app-only for now.

## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /Users/ytkg/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /Users/ytkg/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  3) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  4) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
