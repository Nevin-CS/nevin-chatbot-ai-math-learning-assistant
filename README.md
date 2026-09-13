# Building Agentic AI Challenge

This repository is designed to keep the complete challenge submission in one place: application code, configuration, notebooks, tests, reports, progress tracking, slide references, PDFs, and demo videos.

## Current package status

The Day 6 repository scaffold, progress workbook, report template, security checklist, test plan, reference slides, and repository preflight tooling are included. The actual application source code, project-specific test evidence, GitHub remote URL, and demo video were not supplied and are marked **Needs User Content**.

## Day 6 focus

- Final model and parameter tuning
- Prompt optimization and structured outputs
- Edge-case and fallback behavior
- API performance, token, and rate-limit tuning
- Error handling and debugging
- Final UX improvements
- Prompt-injection, data-leakage, and tool-misuse controls
- Day 7 submission readiness

## Key files

- Progress workbook: `docs/progress/Building_Agentic_AI_Progress_Workbook_Day6.xlsx`
- Day 6 report PDF: `docs/reports/Day_6_Final_Integration_Report_Template.pdf`
- Editable report: `docs/reports/day-06-final-integration-report.md`
- Security checklist: `docs/security/day-06-security-checklist.csv`
- Test plan: `docs/testing/day-06-test-plan.csv`
- Day 6 slides: `assets/day-06/slides/`
- Repository preflight: `scripts/repository_preflight.py`

## Repository map

```text
app/                         Application entry points or UI
src/                         Core source code
tests/                       Automated tests
notebooks/                   Exploration and evaluation notebooks
data/                        Safe sample data only
config/                      Prompt, guardrail, and tool-policy examples
docs/architecture/           Architecture diagrams and decisions
docs/progress/               Progress workbook
docs/reports/                Editable and PDF reports
docs/security/               Security checklist and evidence
docs/testing/                Test plan and results
assets/day-06/slides/        Supplied Day 6 reference images
assets/pdfs/                 Additional challenge PDFs
assets/videos/               Demo videos or link files
security/                    Adversarial test cases
scripts/                     Preflight and Git LFS setup helpers
```

## Add the real project files

1. Put the application in `app/` and/or `src/`.
2. Add automated tests under `tests/`.
3. Add safe sample data only under `data/`; do not upload private data.
4. Add challenge PDFs under `assets/pdfs/` or `docs/reports/`.
5. Add demo videos under `assets/videos/`. Run `scripts/setup_git_lfs.sh` first for large videos.
6. Replace all `[TO UPDATE]` fields in the report and workbook with evidence links.
7. Run `python scripts/repository_preflight.py` before committing.

## Push to GitHub

Create an empty GitHub repository, then run:

```bash
git init -b main
python scripts/repository_preflight.py
git add .
git commit -m "Add challenge deliverables through Day 6"
git remote add origin <REMOTE-URL>
git push -u origin main
```

For large videos, install Git LFS and run `scripts/setup_git_lfs.sh` before `git add .`.

## Security rules

- Never commit API keys, passwords, private keys, tokens, or real `.env` files.
- Treat user input, retrieved documents, files, and tool output as untrusted data.
- Keep tool access default-deny, role-scoped, server-validated, and confirmation-gated for sensitive actions.
- Validate structured model output before rendering it or passing it to another tool.
- Redact sensitive values in logs, traces, screenshots, reports, and videos.

## Large-file guidance

GitHub documentation states that browser uploads are limited to 25 MiB and regular Git blocks files over 100 MiB. Use Git LFS or release assets for larger binaries. See `docs/github/GITHUB_UPLOAD_GUIDE.md` for the official references and commands.
