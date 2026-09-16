# Tembusu Ethics

A browser-only Participant Information Sheet and Consent Form generator for Tembusu College coursework studies.

## Run and verify

Node.js 22 or newer is recommended.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
npx tsx scripts/generate-samples.ts
```

The four-step wizard generates an editable Word document using a cleaned copy of the supplied template. It preserves the original Tembusu/NUS header and A4 page geometry and supplies dynamic page numbering. The consent form begins on a new page.

All form entries exist only in React memory. No analytics, cookies, browser storage, external form services or API keys are used. The only document-generation request fetches the same-origin blank document base, with no entered values. Refreshing clears the form. Static site assets can be requested from GitHub Pages normally.

Fellow-in-Charge names and automatic emails are maintained in `src/data/fellows.ts`. Courses are in `src/data/courses.ts`; the official first course name is the user-approved sole exception to the coursework terminology rule. Standard document wording is in `src/data/documentText.ts`; deterministic checks are in `src/lib/reviewRules.ts`. Checks use validation and keyword matching, not semantic interpretation. Warnings and fellow-review flags do not block generation; errors do.

## Publish

GitHub Pages uses the included Actions workflow. Set repository Settings → Pages → Source to GitHub Actions. Every push to main runs the tests and production build before publishing. Relative asset paths support the repository URL and custom domains.

## Template provenance

`public/document-base.docx` is a sanitized layout-only derivative of the supplied template: all old body content and core author metadata are removed. The original header and logo are preserved. The footer’s fixed total is replaced with NUMPAGES. The original supplied file is not published.

This tool supports coursework preparation and does not provide formal ethics approval. Selected safeguards show Fellow-in-Charge review notices before participant recruitment.
