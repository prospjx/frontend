from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Smart Scheduler Frontend Service",
    version="1.0.0",
    description="Serves the static web application and health check probes.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root directory containing static HTML/CSS/JS assets
FRONTEND_DIR = Path(__file__).resolve().parent.parent


@app.get("/health")
def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return {"status": "ok", "service": "frontend"}


@app.get("/")
def serve_index():
    """Serves the primary Single Page Application HTML entry point."""
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.is_file():
        return {"error": "index.html not found"}
    return FileResponse(index_path, media_type="text/html")


# Mount root directory to serve static assets (styles.css, app.js, config.js, ui.js, api.js)
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="static")
