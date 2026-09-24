# API Contracts — HireMe Admin

## Auth (JWT)
- POST `/api/auth/login` { email, password } -> { access_token, token_type, user{name,email,role} }
- GET  `/api/auth/me` (Bearer) -> user
- Seeded superadmin: admin@hireme.in / admin123

## Education Categories (Bearer protected)
Model: { id, name, trending(bool), status(bool), updatedBy(str), updatedAt(str "24 Sep 2026") }
- GET    `/api/education-categories`            -> [category]
- POST   `/api/education-categories`            { name, status, trending } -> category
- PUT    `/api/education-categories/{id}`       { name?, status?, trending? } -> category
- DELETE `/api/education-categories/{id}`       -> { success }

## Education Sub Categories (Bearer protected)
Model: { id, name, category(str parent name), status(bool), updatedBy, updatedAt }
- GET    `/api/education-sub-categories`        -> [subcategory]
- POST   `/api/education-sub-categories`        { name, category, status } -> subcategory
- PUT    `/api/education-sub-categories/{id}`   -> subcategory
- DELETE `/api/education-sub-categories/{id}`   -> { success }

## Dashboard (Bearer protected)
- GET `/api/dashboard` -> { stats[], jobsCreatedMonthly[], jobsByIndustry[], candidatesMonthly[], recentCompanies[], recentJobs[] }
  (Dashboard analytics values are static/demo — no live jobs/candidates collections.)

## Mocked -> Real
- mock.js data replaced by API for: auth, education categories, education sub categories, dashboard.
- Homepage stays frontend-only (visual clone) using mock.js + CDN assets.

## Integration
- Frontend stores JWT in localStorage `hireme_token` + user in `hireme_admin`.
- axios instance adds Authorization: Bearer <token>. 401 -> redirect to /admin/login.
