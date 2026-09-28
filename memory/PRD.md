# HireMe Job Portal — PRD

## Original Problem Statement
Job portal like foundit. Superadmin panel + public pages. Colors Blue #2c0eee, Red #f61d25, Poppins font. 24 masters with bulk CSV, Companies module, Candidates module, and a Recruiter portal.

## Architecture
- Frontend: React 19 + Tailwind + Shadcn UI + React Router + Axios. `react-quill-new` for rich text.
- Backend: FastAPI + Motor (MongoDB) + PyJWT + passlib (pbkdf2_sha256).
- Auth surfaces: (1) Superadmin `admin_users` JWT (/api/auth/*); (2) Recruiter/company JWT with `type:recruiter` claim (/api/recruiter/*).

## Key Files
- Admin masters: `frontend/src/pages/admin/mastersConfig.js`, `MasterPage.jsx`, `MasterFormPage.jsx`
- Companies: `frontend/src/pages/admin/CompaniesList.jsx`, `CompanyForm.jsx` (gated wizard)
- Candidates: `frontend/src/pages/admin/CandidatesList.jsx`, `CandidateForm.jsx` (gated wizard)
- Shared: `frontend/src/components/admin/RichTextEditor.jsx`, `MultiSelect.jsx`
- Recruiter portal: `frontend/src/recruiter/RecruiterLanding.jsx`, `RecruiterSignup.jsx`, `recruiterApi.js`
- Backend: `backend/server.py`

## Implemented
- Home clone, superadmin JWT auth, 24 masters + bulk CSV, India cities/states seed, Companies CRUD.
- **2026-06/09: Add Company redesigned** as gated 4-step wizard + rich text About. Tested 9/9.
- **2026-09: UI fixes + Candidates module.** Logo z-index fix, sticky full-height sidebar, Candidates list + gated 4-step wizard (multi-select skills/languages, rich text About, photo/resume base64). Backend `/api/candidates`. Tested 17/17 backend, 11/11 frontend.
- **2026-09: Recruiter portal.** Public routes `/recruiter` (marketing landing + inline login) and `/recruiter/signup` (Company/Consultant tabs, basic info, company details, address, terms). Original design, HireMe brand, generated images. Backend: `/api/recruiter/signup` (creates company status=pending), `/api/recruiter/login`, `/api/recruiter/me` (Bearer, type:recruiter claim), `/api/public/{industries,sub-industries,states,cities}`. companies.email sparse-unique index. Tested 13/13 backend, 100% frontend.

## Deployment note
`frontend/.env` REACT_APP_BACKEND_URL = user's VPS `https://backend.hiremejobs.co.in`. Emergent preview resolves to preview backend. User must redeploy `backend/server.py` and rebuild frontend on their VPS. Recruiter subdomain `recruiter.hiremejobs.co.in`: serve same build via Nginx with `location = / { return 302 /recruiter; }` + SPA `try_files $uri /index.html`.

## Backlog / Future
- P1: Recruiter dashboard (post jobs, search resumes) after login — currently login shows a "pending approval" card.
- P1: Lock backend CORS from `["*"]` to allow-list.
- P2: Recruiter signup server-side validation (mobile/zip formats), password strength, login rate limiting.
- P2: Public candidate/company profile pages; recruiter forgot-password.
- P2: Refactor large server.py into routers.

## Credentials
- Admin: admin@hireme.in / admin123
- Recruiter demo: recruiter@acme.com / pass1234 (status pending)
