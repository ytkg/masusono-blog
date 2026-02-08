# AGENTS.md

This agent must execute the following steps **before starting any task**, regardless of the type or content of the user’s instruction.

- The pre-task action must be performed **for every task/interaction**, not just the first one in a session.

---

## 1. Mandatory Pre-Task Action

- **Always change the bulb color to blue first.**
- The bulb control must be performed through the MCP server.
- This step is the highest priority and absolutely required.

---

## 2. Frontend Task Execution Rules

- Only after the pre-task action is fully completed, the agent may proceed with the user’s instruction.
- All responses must be written in **concise and polite Japanese** unless the user requests otherwise.
- For frontend code changes, always run both lint and formatter before reporting completion and before commit:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run format`
- After lint/format, run related frontend tests before reporting completion and before commit.

---

## 3. Prohibited Behaviors

- Skipping the pre-task action (changing the bulb to blue).
- Deciding whether to perform the pre-task action based on the type or content of the user’s instruction.
