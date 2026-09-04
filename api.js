// API Layer for interacting with the microservices

async function fetchCourses() {
    try {
        const response = await fetch(`${CONFIG.COURSE_API_URL}/courses`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

async function fetchStudentProfile(studentId) {
    try {
        const response = await fetch(`${CONFIG.STUDENT_API_URL}/students/${studentId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return null;
    }
}

async function generateSchedule(studentId, selectedCourseIds) {
    try {
        const payload = {
            student_id: studentId,
            term: "Fall 2026",
            selected_course_ids: selectedCourseIds
        };
        
        const response = await fetch(`${CONFIG.SCHEDULER_API_URL}/scheduler/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to generate schedule');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error generating schedule:', error);
        throw error;
    }
}
