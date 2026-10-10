# Smart Course Scheduler Frontend (`frontend`)

A modern, responsive Single Page Application (SPA) providing an interactive user interface for course schedule optimization, multimodal timetable extraction, and 7-day life routine planning.

Hosted in an **Amazon S3** static bucket and distributed globally via **Amazon CloudFront CDN** with Origin Access Control (OAC).

---

## Features

- **Multimodal Timetable Drag & Drop**:
  - Drag and drop or upload timetable screenshots (PNG, JPG, WEBP).
  - Automatically queries Google Gemini Vision to extract class slots into editable schedules.
- **Interactive Course Selection**:
  - Browse real-time course listings from the university catalog.
  - One-click selection with live credit calculation.
- **Algorithmic Schedule Optimization**:
  - Triggers the constraint-satisfaction scheduler to build conflict-free academic schedules.
  - Interactive calendar grid view (Monday through Friday/Sunday).
- **Comprehensive 7-Day Life & Routine Planner**:
  - Merges classes with commute transit buffers, study sessions, gym workouts, meals, and sleep routines.
  - Color-coded activity cards (Class, Transit, Study, Gym, Sleep, Wakeup, Meal, Personal).
- **AI Insights & Health Analysis**:
  - Executive summary of schedule pacing, stress warnings, and actionable recommendations.
- **Student Preferences Modal**:
  - Configure target wake-up time, sleep schedule, daily study hours, commute transit time, and gym preferences.
- **Resilient API Layer**:
  - Automatic detection of CloudFront CDN domain vs local development environment (`config.js`).
  - Graceful error boundary catching network timeouts and upstream gateway issues.

---

## Project Structure

```
frontend/
├── index.html       # Single page application entry point
├── styles.css       # Dark-mode modern CSS design system
├── config.js        # Environment & CloudFront routing config
├── api.js           # Fetch API client abstraction
└── app.js           # UI logic, calendar rendering, and event handlers
```

---

## Local Development

You can serve the static files with any local HTTP server:

```bash
# Python simple HTTP server
python -m http.server 3000

# Or with Node.js npx
npx serve .
```

Navigate to `http://localhost:3000` in your web browser.

---

## Deployment to AWS (S3 + CloudFront)

```bash
# Sync assets to S3 (excluding virtual environments and caches)
aws s3 sync . s3://scsdev-my-test-bucket-20260911/ --delete --exclude "venv/*" --exclude "tests/*" --exclude "__pycache__/*"

# Invalidate CloudFront CDN Cache
aws cloudfront create-invalidation --distribution-id E3DTFQC2W572J0 --paths "/*"
```
