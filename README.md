# OrbitPost

A responsive social-media workspace with a browser-based video studio and a FastAPI backend.

## Features
- Dashboard, post composer, drafts, publishing queue, calendar, media library, channels and analytics.
- Video studio: local video/image upload, preview, trim range, crop/aspect presets, rotation, playback speed, volume, text overlay, filters, clip list and browser-side MP4/WebM export (browser codec support varies).
- Local-first mode: the frontend remains usable without a running API and stores posts, drafts, queue and channel connection placeholders in browser localStorage.
- FastAPI API with SQLite persistence, post CRUD, channel listing, publishing queue and media upload.
- Clear demo/connected status: social channels are not genuinely connected and publishing is not sent to external platforms until official API credentials and OAuth flows are configured.

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API: http://127.0.0.1:8000  
Swagger: http://127.0.0.1:8000/docs

### 2. Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal. The frontend defaults to `http://127.0.0.1:8000` for the API. Set `VITE_API_URL` in `frontend/.env` if needed.

## Video export notes
The studio uses browser media APIs and Canvas. Export availability depends on browser codecs and media support. Chrome/Edge desktop are recommended. Some source videos with unusual codecs may preview but not export. This is a practical starter editor, not a frame-accurate nonlinear editor.

## Real social publishing
The app intentionally does not fake successful external publishing. To enable it, implement each platform's official OAuth/API flow, store secrets server-side, request required scopes, and comply with platform review and publishing restrictions. Never put API secrets in the frontend.
