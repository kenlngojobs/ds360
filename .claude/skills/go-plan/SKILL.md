---
name: go-plan
description: >
  Polaris-aligned methodology for planning and executing complex or multi-stage directives.
  Combines task classification, gated consent cycles, recursive subtask decomposition,
  and verified execution into a single structured workflow. ALWAYS activate for:
  multi-file code changes, feature building, refactoring, research chains, infrastructure
  changes, browser automation sequences, or any task where failure mid-way would leave
  the system in a corrupt or inconsistent state. Also activate when the user says:
  "go_plan", "go plan", "plan this out", "step by step", "don't hang", "break this down",
  "complex task", or any directive that clearly requires more than 5 tool calls to complete
  safely. Do NOT activate for single-step queries, trivial file reads, or conversational responses.
compatibility: "Claude (Cowork / Claude Code)"
argument-hint: "[task description]"
metadata:
  version: "1.0"
  last-modified: "2026-03-28"
---

# Task-Planner Skill

**Purpose**: Ensure high-caution, structured execution of non-trivial directives through
classification, consent-gated planning, recursive decomposition, and verified completion.

---

## Phase 0 — Task Classification

Before any execution, classify the directive as **Basic** or **Complex**.

| Class | Criteria | Action |
| :--- | :--- | :--- |
| **Basic** | Single command, single file read/write, one tool call | Execute immediately. No plan required. |
| **Complex** | Multi-file changes, feature builds, refactors, research chains, >5 tool calls | Proceed to Phase 1. |

If in doubt, treat as Complex. The cost of an unnecessary plan is one turn. The cost of
a failed unplanned execution can be file corruption or irreversible state.

---

## Phase 1 — Planning (Consent Gate)

For Complex tasks:

1. **Draft `implementation_plan.md`** in the project root (or Cowork working directory).
   Use this exact structure:

```markdown
# Implementation Plan: [Task Name]
**Created**: [timestamp]
**Status**: AWAITING CONSENT

## Objective
[One sentence. What does done look like?]

## Risk Assessment
[What could go wrong? What files/systems are mutated? Is this reversible?]

## Phases
### Phase 1: [Name]
- Step 1.1: [Description] — Tool: [Read/Write/Edit/Bash/etc.]
- Step 1.2: [Description] — Tool: [...]

### Phase 2: [Name]
- Step 2.1: ...

## Verification Criteria
[How will each phase be confirmed complete? What does success look like?]

## Rollback Path
[If Phase N fails, what is the recovery action?]
```

2. **Present the plan to Ken.** Summarize it in 2–3 sentences in the response.

3. **HARD TERMINATE.** Drop all active threads. Do not begin execution. Await Ken's
   explicit directive to proceed. "Looks good", "go ahead", "do it" — all count.
   Silence does not count.

---

## Phase 2 — Execution (Gated Cycle)

Upon Ken's explicit consent:

1. **Acquire the gate**: Mark the first task `in_progress` via TodoWrite before
   touching any file or running any command. This is the mutex — there must always
   be exactly one `in_progress` task at a time.

2. **Create `task.md`** in the same directory as `implementation_plan.md`:

```markdown
# Task: [Task Name]
**Status**: IN PROGRESS
**Created**: [timestamp]

## Subtasks

- [ ] SUBTASK_1: [Description] `[BOUNDARY: START]`
- [ ] SUBTASK_2: [Description]
- [ ] SUBTASK_N: [Description] `[BOUNDARY: END]`

## Log
- [timestamp] — Task initialized. Consent received.
```

3. **Execute subtasks sequentially**. Never run subtasks in parallel unless explicitly
   directed and the subtasks are provably non-overlapping on shared files.

---

## Phase 3 — Subtask Execution Protocol

### Granularity Rule
Each subtask must involve **no more than 3–5 tool calls**. If a subtask cannot be
completed within that budget, decompose it further before beginning. A subtask that
"feels like it needs more calls" is two subtasks.

### task_boundary Markers
After completing each subtask, write a boundary marker to `task.md` **before** moving on:

```
`[BOUNDARY: SUBTASK_N COMPLETE — verified: yes]`
```

If verification fails:
```
`[BOUNDARY: SUBTASK_N FAILED — reason: <specific reason>]`
```

A boundary marker is not optional. It is the handshake between subtasks. Skipping it
means the next subtask starts without confirmed prior state — which is how silent failures
compound into unfixable corruption.

### Verification Gate
A subtask is not complete until:
- The expected output **exists** (confirmed via Read or Bash)
- The output **is correct** (not just present — spot-check the content)
- The `task_boundary` marker is **written to `task.md`**

Assumption is not verification. If you cannot confirm the output, write `verified: no`
and halt.

### TodoWrite Sync
Keep TodoWrite synchronized with `task.md` at all times:
- Mark a subtask `in_progress` in TodoWrite before beginning it
- Mark it `completed` in TodoWrite only after the boundary marker is written
- Never have two tasks `in_progress` simultaneously

---

## Phase 4 — Failure Protocol

If any subtask fails verification:

1. Write `[BOUNDARY: SUBTASK_N FAILED — reason: ...]` to `task.md`.
2. Update TodoWrite: keep the failed subtask `in_progress`. Do not mark it complete.
3. **Halt the chain.** Do not attempt subsequent subtasks.
4. Report to Ken:
   - Which subtask failed
   - Last known good state
   - Exact error or verification mismatch
   - Recommended recovery action
5. **HARD TERMINATE.** Await Ken's directive before retrying.

Do not silently retry. Silent retries mask root cause and can compound state corruption.

---

## Phase 5 — Completion (Lock Release)

When all subtasks are verified complete:

1. Update `task.md` status to `COMPLETE`. Write a final log entry with timestamp.
2. Mark all TodoWrite items `completed`.
3. Update `implementation_plan.md` status to `COMPLETE`.
4. Report to Ken:
   - Subtasks completed (count)
   - Any subtasks skipped and why
   - Total tool calls used (estimate)
   - Any residual risk or follow-up actions
5. **HARD TERMINATE.** Drop active threads. Return to standby. Do not chain
   unsolicited follow-on actions.

---

## Browser Subagent Rules

When dispatching browser subagents:
- One navigation action per subagent call. Never chain navigations within a single call.
- Define a clear, specific return condition before dispatching.
- Treat each browser subagent result as unverified until the return condition is confirmed met.

---

## Adversarial Pre-flight (Mandatory for Complex Tasks)

Before executing any phase, perform an internal check:
- Does any step mutate a file that another step also reads? (Write-after-read hazard)
- Is any external command being run with unsanitized input?
- Does the rollback path actually work if Phase 1 succeeds but Phase 2 fails?
- Is there a dependency between phases that isn't explicitly modeled in the plan?

Surface any findings in the response before execution begins. Do not suppress concerns
to appear efficient.
