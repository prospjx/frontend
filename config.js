// Configuration for the Frontend Application
// In a real deployment on EKS, you would swap these out for your Ingress controller URLs (e.g., https://api.yoursite.com/courses)
const CONFIG = {
    // Localhost ports matching the microservices
    COURSE_API_URL: 'http://127.0.0.1:8001/api/v1',
    STUDENT_API_URL: 'http://127.0.0.1:8002/api/v1',
    SCHEDULER_API_URL: 'http://127.0.0.1:8000/api/v1',
    
    // The hardcoded mock student ID we created in the studentapi seed script
    DEFAULT_STUDENT_ID: '123e4567-e89b-12d3-a456-426614174000'
};
