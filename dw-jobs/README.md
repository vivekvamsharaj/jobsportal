# Daily Wage Jobs Portal (Telugu / English / Hindi) - with 10 km nearby search
Stack: MongoDB + Express + React (Vite) + Node, JWT auth, react-i18next, MongoDB geospatial (2dsphere).

## Run
1. Start MongoDB locally.
2. Server: cd server && npm i && cp .env.example .env && npm run dev
3. Client: cd client && npm i && npm run dev  -> http://localhost:5173
(Browser GPS works only on localhost or HTTPS.)

## How location works
- Employer posts a job and taps "Use my location" -> lat/lng saved as GeoJSON Point.
- Worker opens Jobs -> browser GPS -> GET /api/jobs/nearby?lat=&lng=&radius=10
- MongoDB $geoNear returns only jobs within radius, sorted nearest first, with distance.
- Worker sees owner's address, phone (tap to call), embedded map and a Google Maps directions link.

## API
POST /api/auth/register | /api/auth/login
GET  /api/jobs/nearby?lat&lng&radius(km)&category
POST /api/jobs (employer) | GET /api/jobs/mine | GET /api/jobs/:id/applicants
POST /api/applications/:jobId (worker) | GET /api/applications/mine
