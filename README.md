# Stoma Alert

Stoma Alert is a full-stack recovery-support prototype for people living with a stoma and the care teams supporting them.

## What works

- Persistent four-part wellbeing check-ins
- Patient diary and protected photo uploads
- Live progress summaries and CSV exports
- Supply reorder requests and request history
- Learning progress tracking
- Editable patient and stoma profiles
- Two-way patient and nurse messaging
- Nurse caseload, reporting and export views
- Administrator supply and patient-content views
- Responsive patient, nurse and administrator interfaces

## Technology

- Next.js/Vinext and React
- TypeScript
- Cloudflare D1 for structured records
- Cloudflare R2 for private diary photos
- Drizzle schema and migrations
- Lucide interface icons

## Run locally

Prerequisites: Node.js 22.13 or later.

```bash
npm ci
npm run dev
```

The production build is validated with:

```bash
npm test
npm run lint
```

Local development uses simulated bindings. A hosted deployment must provide the `DB` D1 binding and `BUCKET` R2 binding declared in `.openai/hosting.json`.

Vercel runs the native Next.js build. When Cloudflare bindings are not present,
the public prototype remains interactive by keeping its demonstration changes
in the browser on that device. On-device prototype photos are limited to 1 MB.
This fallback is for evaluation only and must not be used for real patient data.

## Data and safety

This repository is a product prototype using demonstration data. It is not a medical device, does not diagnose or recommend treatment, and must not be used with real patient data until appropriate clinical-safety, information-governance, security, regulatory and integration work has been completed.

For a UK clinical deployment, the remaining programme includes identity and role enforcement, DCB0129/DCB0160 clinical safety, DSPT, DPIA, penetration testing, accessibility assurance, NHS integration and production operating controls.
