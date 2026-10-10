// Configuration for the Frontend Application
// In a real deployment on EKS, you would swap these out for your Ingress controller URLs (e.g., https://api.yoursite.com/courses)
const isCloudFront = window.location.hostname.includes('cloudfront.net');
const API_HOST = window.location.hostname || 'localhost';

const CONFIG = {
    // If loaded on CloudFront, route through the unified CloudFront origin (/api/v1)
    COURSE_API_URL: isCloudFront ? '/api/v1' : `http://${API_HOST}:8001/api/v1`,
    STUDENT_API_URL: isCloudFront ? '/api/v1' : `http://${API_HOST}:8002/api/v1`,
    SCHEDULER_API_URL: isCloudFront ? '/api/v1' : `http://${API_HOST}:8000/api/v1`,
    AI_ASSISTANT_API_URL: isCloudFront ? '/api/v1' : `http://${API_HOST}:8003/api/v1`,
    
    // The hardcoded mock student ID we created in the studentapi seed script
    DEFAULT_STUDENT_ID: '123e4567-e89b-12d3-a456-426614174000'
};

