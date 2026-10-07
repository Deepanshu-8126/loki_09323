# Token Efficiency & Context Management (Caveman + RTK Protocol)

## Output & Response Rules (Save ~65% Output Tokens)
- **High Signal, Zero Filler**: Answer directly. Never include conversational pleasantries, introductory chatter ("Sure, I can help with that..."), or post-action restatements.
- **Payload Verbatim**: Output only exact diffs, commands, and actionable code. Do not reprint unmodified surrounding code.
- **Terse Explanations**: One concise sentence per thought. Explain *why* something was changed, not a line-by-line narration of what the code does.

## Command & Terminal Optimization (Save 60-90% CLI Tokens)
- **Compact Inspection**: When running terminal commands (`git diff`, `npm test`, directory listings), filter out passing tests and boilerplate.
- **Surgical Inspection**: Never dump entire files or directories. Use precise line ranges and ripgrep queries with targeted globs.

## Memory & Context Boundaries
- Keep working memory tight. Avoid accumulating unnecessary files in context.
- Once a subtask completes, discard temporary debug outputs.
