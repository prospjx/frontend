// Configuration for the Frontend Application
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isCloudFront = window.location.hostname.includes('cloudfront.net');

// Live deployed Render API Gateway URL
const REMOTE_BACKEND_URL = window.SCS_BACKEND_URL || "https://scsrepository.onrender.com";

const getBaseUrl = (port) => {
    if (isLocal) {
        return `http://127.0.0.1:${port}/api/v1`;
    }
    if (isCloudFront) {
        return '/api/v1';
    }
    // Hosted on GitHub Pages / Vercel: All calls route through the Render Gateway
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
