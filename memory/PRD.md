# HireMe Job Portal — PRD

## Original Problem Statement
Job portal like foundit. Started with a superadmin + home page (pixel clone of https://hiremejobs.in/, colors Blue #2c0eee, Red #f61d25). Expanded to 24 masters with bulk CSV upload/download and a dedicated Companies management module.

## Architecture
- Frontend: React 19 + Tailwind + Shadcn UI + React Router + Axios. `react-quill-new` for rich text.
- Backend: FastAPI + Motor (MongoDB) + PyJWT.
- Superadmin JWT auth (admin@hireme.in / admin123).
- Config-driven Masters (24 tables) via `mastersConfig.js` + generic `MasterPage/MasterFormPage`.
- Companies module: dedicated CRUD.

## Key Files
- `/app/frontend/src/pages/admin/mastersConfig.js` — master schemas.
- `/app/frontend/src/pages/admin/MasterPage.jsx` / `MasterFormPage.jsx` — generic engines.
- `/app/frontend/src/pages/admin/CompanyForm.jsx` — Add/Edit Company **step wizard**.
- `/app/frontend/src/components/admin/RichTextEditor.jsx` + `rich-text.css` — reusable Quill editor.
- `/app/backend/server.py` — all backend logic.

## Implemented
- (Earlier) Home clone, JWT auth, 24 masters + bulk CSV, India cities/states seed, Companies CRUD.
- **2026-06-27: Add Company page fully redesigned** into a gated 4-step wizard (Overview → Relations → Media → Status). Live preview card, vertical stepper with lock/complete states, top progress bar, Back/Continue nav. Steps cannot be skipped without filling required fields (Overview: Name+About; Relations: Industry+Company Size; Media: Logo). About Company is now a full rich text editor. Tested — 9/9 pass.
- **2026-06-27: UI fixes + Candidates module.**
  - Fixed company preview logo overlapping under the banner (added `relative z-10`).
  - Sidebar is now full-height sticky (`lg:sticky lg:top-0`), stays in view on scroll.
  - New **Candidates** top-level module: list page (`CandidatesList.jsx`) + gated 4-step add/edit wizard (`CandidateForm.jsx`) mirroring Companies. Steps: Personal (Name+Email+Phone required) → Professional (Experience Level required) → Education & Skills (multi-select skills/languages) → Profile & Status (rich text About, resume/photo base64 upload, status, featured). Backend CRUD at `/api/candidates` (`CANDIDATE_FIELDS` in server.py). Tested — 17/17 backend, 11/11 frontend pass.

## New Files (2026-06-27)
- `/app/frontend/src/components/admin/RichTextEditor.jsx` + `rich-text.css`
- `/app/frontend/src/components/admin/MultiSelect.jsx`
- `/app/frontend/src/pages/admin/CandidatesList.jsx`
- `/app/frontend/src/pages/admin/CandidateForm.jsx`

## IMPORTANT — Production deploy note
`frontend/.env` REACT_APP_BACKEND_URL = `https://backend.hiremejobs.co.in` (user's own VPS). The Emergent preview works (platform resolves to the preview backend), but the user MUST redeploy the updated `/app/backend/server.py` (candidate routes) to their VPS for Candidates to work in their production.

## Backlog / Future
- P1: Lock backend CORS from `["*"]` to a `CORS_ORIGINS` env var (offered, awaiting user go-ahead).
- P2: Refactor large `server.py` into routers.
- Render company `about` HTML safely wherever the company profile is displayed (use `.rte-render` class).

## Credentials
admin@hireme.in / admin123
