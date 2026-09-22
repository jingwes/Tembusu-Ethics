# Tembusu Ethics

A browser-only Participant Information Sheet and Consent Form generator for Tembusu College coursework studies. Students complete a four-step form and download a single editable Word document.

## What it produces

One `.docx` containing both the Participant Information Sheet and the Consent Form. The consent form begins on a new page. The document is generated from a cleaned copy of the supplied template, so it preserves the original Tembusu/NUS header and A4 page geometry, and supplies dynamic page numbering.

## Using the form

Four steps, with progress shown and validation on each.

| Step | What it asks for |
|---|---|
| **1 Details** | Study title, course, Principal Investigator, 1–8 student investigators with NUS email addresses, approximate participant count |
| **2 Language** | How participants take part, duration, eligibility, recording and participant material, ethics safeguards |
| **3 Check** | A study summary, plus the checks described below |
| **4 Documents** | Download the Word document |

The Principal Investigator's email is filled in automatically from the selected name. Copy for each step is written for students: explain what participants will do in your own words.

## Run and verify

Node.js 22 or newer is recommended. CI uses Node 22 for both workflows; the package does not yet declare an `engines` field.

```sh
npm ci
npm run dev                              # http://127.0.0.1
npm test                                 # vitest
npm run build                            # tsc -b && vite build
npm run preview                          # http://127.0.0.1
npx tsx scripts/generate-samples.ts      # generate sample documents
```

There is no lint script in this repository; `npm run build` type-checks via `tsc -b`.

## Checks and safeguards

The form collects five recording and attribution permissions. Each "Yes" adds a separate consent choice to the document:

- audio recording
- video recording
- photography
- direct quotations
- naming a participant's name, role or position alongside their comments

Four safeguards add a Principal Investigator review notice before participant recruitment: significant distress, deception, participants who may not be able to consent independently, and pressure arising from an authority, employment, caregiving, academic or dependent relationship. The safeguard questions are used for the study check and are **not** printed in the document.

Checks are **deterministic validation and keyword matching, not semantic interpretation** (`src/lib/reviewRules.ts`). **Errors block generation; warnings and Principal Investigator review flags do not.** Warnings may be dismissed and will reappear after the study details change.

Minimum participant age is fixed at 18 for NUS students and 21 for non-NUS students. Optional exclusion criteria appear only when entered.

## Privacy

All form entries exist only in React memory. There are no analytics, no cookies, no browser storage, no external form services and no API keys. The only document-generation request fetches the same-origin blank document base, with no entered values. Refreshing or closing the page clears your entries. Static site assets are requested from GitHub Pages normally.

## Scope

This tool supports coursework preparation and **does not provide formal ethics approval**. Where safeguards are flagged, it shows Principal Investigator review notices that should be addressed before participant recruitment. Review the generated document before sharing it with participants.

## Where to edit

| Path | Contents |
|---|---|
| `src/data/fellows.ts` | Principal Investigators and their automatic emails |
| `src/data/courses.ts` | Course list — the official first course name is the user-approved sole exception to the coursework terminology rule |
| `src/data/documentText.ts` | Standard document wording |
| `src/data/questions.ts` | Participation methods, permission prompts and safeguard questions |
| `src/types/study.ts` | Shared study types |
| `src/lib/reviewRules.ts` | Deterministic review checks |
| `src/lib/validation.ts`, `src/lib/generateDocx.ts` | Field validation and document generation |
| `src/components/Fields.tsx`, `src/App.tsx` | Form components and the wizard |

## Publishing

GitHub Pages uses the included Actions workflow. Set repository **Settings → Pages → Source** to GitHub Actions. Every push to `main` runs the tests and the production build before publishing. Relative asset paths support both the repository URL and custom domains.

`.github/workflows/quality.yml` is **manual-dispatch only** and does not run on push. It builds, installs Chromium, runs the browser QA script, generates sample documents, then renders every generated `.docx` with LibreOffice and uploads the renders as a short-lived artifact.

## Template provenance

`public/document-base.docx` is a sanitized layout-only derivative of the supplied template: all old body content and core author metadata are removed. The original header and logo are preserved. The footer's fixed total is replaced with `NUMPAGES`. The original supplied file is not published.

## Project files

| Path | Contents |
|---|---|
| `src/` | Application, components, data and document logic |
| `public/` | `document-base.docx` template base and the Tembusu/NUS logo |
| `scripts/` | `generate-samples.ts`, `browser-qa.mjs`, `render_docx.py` |
| `tests/` | Vitest rules tests and fixtures |
| `.github/workflows/` | `deploy.yml` (push to main) and `quality.yml` (manual) |
