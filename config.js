// Configuration for the Frontend Application
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isCloudFront = window.location.hostname.includes('cloudfront.net');

// Set your live deployed backend URL here when you deploy on Render/Railway (e.g. "https://scs-backend.onrender.com")
const REMOTE_BACKEND_URL = window.SCS_BACKEND_URL || "https://your-backend-service.onrender.com";

const getBaseUrl = (port) => {
    if (isLocal) {
        return `http://127.0.0.1:${port}/api/v1`;
    }
    if (isCloudFront) {
        return '/api/v1';
    }
    // Hosted on GitHub Pages / Vercel: All calls go to the unified backend
    return `${REMOTE_BACKEND_URL}/api/v1`;
};

const CONFIG = {
    COURSE_API_URL: getBaseUrl(8001),
    STUDENT_API_URL: getBaseUrl(8002),
    SCHEDULER_API_URL: getBaseUrl(8000),
    AI_ASSISTANT_API_URL: getBaseUrl(8003),
    
    // Default mock student ID
    DEFAULT_STUDENT_ID: '123e4567-e89b-12d3-a456-426614174000'
};
