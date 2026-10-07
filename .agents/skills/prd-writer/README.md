# prd-writer

> A Claude Code skill that turns fuzzy product ideas into shippable Product Requirement Documents — delivered as a professionally formatted `.docx` file.

[简体中文](./README.zh-CN.md) · English

`prd-writer` is a [Claude Code](https://claude.com/claude-code) skill that walks Claude through the full job of writing a PRD: collecting domain knowledge, interrogating requirements along three dimensions, designing the document structure, drafting each chapter, self-reviewing the draft, and finally rendering a polished Word document.

It is opinionated on purpose. PRDs fail when the product manager invents business rules the team never confirmed, or when "what to build" gets tangled with "how to build it". This skill keeps Claude honest about both.

## Why this skill exists

Most "write me a PRD" prompts produce beautiful-looking documents full of hallucinated requirements. This skill fights that in three specific ways:

- **Never invent business rules.** Every functional point has to pass a three-dimension check — *data source*, *business rule*, *exception handling* — before the skill moves on. Anything Claude doesn't know, it asks the user about.
- **Stay inside the product manager lane.** The skill defines what to build and why, not URL paths, table schemas, or CSS. A sanity check ("would another dev team need to know this?") is baked into Phase 3.
- **Ship a real deliverable.** The final output is a `.docx` with cover page, TOC, three-line tables, and page headers — not a Markdown dump.

## Features

- **Three modes** — *New* (from scratch), *Complete* (fill gaps in an existing draft), *Research* (collect domain background only).
- **Recursive three-dimension interrogation** — every feature must resolve data source, business rule, and exception handling before drafting.
- **Non-Goals as a first-class section** — explicit scope fences, each with a written reason, to prevent mid-flight scope creep.
- **Given/When/Then acceptance criteria** — so developers and QA can lift them straight into test plans.
- **Leading + lagging metrics** — leading indicators (adoption, completion rate) for week-one validation, lagging indicators (retention, NPS) for long-term verdict, both with target numbers.
- **Open items with owners** — every unresolved question is tagged with an accountable role and whether it blocks development.
- **Domain knowledge memory** — captured background is written to `docs/prd-knowledge/<domain>/<module>.md` in your project so the next PRD in the same space starts smarter.
- **Built-in self review** — a senior-PM-grade review pass (completeness, consistency, testability, scope clarity) before the `.docx` is generated.

## Installation

Clone the repository into your Claude Code skills directory:

```bash
git clone https://github.com/GarrusHuang/prd-writer.git ~/.claude/skills/prd-writer
```

That's it. Claude Code auto-discovers skills placed in `~/.claude/skills/`. The next time you mention PRDs, requirement documents, or feature specs in Claude Code, the skill will activate.

### Dependencies

`prd-writer` delegates final `.docx` generation to two other skills. Install these as well:

- **[`docx`](https://github.com/anthropics/skills)** — Word document generation (required for `.docx` output).
- **[`docx-chinese-fix`](https://github.com/anthropics/skills)** — Chinese string handling rules (required if you write PRDs in Chinese; prevents JavaScript syntax errors caused by Chinese curly quotes).

Without these, Phase 5 (the `.docx` export) may fail or produce broken files. You can still use Phases 0–4 to draft and review the PRD content as plain text.

## Usage

Just talk to Claude Code the way you already do. Triggers include phrases like:

- "Write a PRD for …"
- "Help me turn this requirement into a spec document"
- "I have a half-finished requirement doc, can you complete it?"
- "Gather some background research on the X domain first"

Claude will pick the right mode, then run the workflow below.

## Workflow overview

```
Phase 0  Domain background collection
         ↓ (optional; skipped for pure utility products)
Phase 1  Recursive requirement interrogation
         └─ three-dimension check per feature:
            data source · business rule · exception handling
         ↓ all features marked ✅ before proceeding
Phase 2  Document structure design
         └─ user confirms the table of contents
         ↓
Phase 3  Chapter drafting
         └─ uses references/chapter-templates.md
         ↓
Phase 4  Self-review (P0 / P1 / P2 issues)
         ↓ P0 issues fixed
Phase 5  .docx export
         └─ cover page · TOC · three-line tables · headers & footers
```

## Repository layout

```
prd-writer/
├── SKILL.md                       # Skill definition loaded by Claude Code
├── references/
│   └── chapter-templates.md       # Detailed templates for each PRD chapter
├── README.md                      # This file
├── README.zh-CN.md                # Chinese README
└── LICENSE
```

## Contributing

Issues and pull requests are welcome. Areas where contributions are especially useful:

- Domain-specific chapter templates (fintech, healthcare, data products, …)
- Additional product-type adjustments beyond the current AI / B2B / data / mobile presets
- Internationalisation of the chapter templates

## License

Released under the [MIT License](./LICENSE).
