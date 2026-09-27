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
- **2026-06-27: Add Company page fully redesigned** into a gated 4-step wizard (Overview → Relations → Media → Status). Live preview card, vertical stepper with lock/complete states, top progress bar, Back/Continue nav. Steps cannot be skipped without filling required fields (Overview: Name+About; Relations: Industry+Company Size; Media: Logo). About Company is now a full rich text editor (bold/italic/underline/strike/color/lists/align/headings/blockquote/code/link). Tested by testing agent — 9/9 criteria pass.

## Backlog / Future
- P1: Lock backend CORS from `["*"]` to a `CORS_ORIGINS` env var (offered, awaiting user go-ahead).
- P2: Refactor large `server.py` into routers.
- Render company `about` HTML safely wherever the company profile is displayed (use `.rte-render` class).

## Credentials
admin@hireme.in / admin123
