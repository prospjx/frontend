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

async function updateStudentProfile(studentId, profileData) {
    try {
        const response = await fetch(`${CONFIG.STUDENT_API_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to update student profile');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating student profile:', error);
        throw error;
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

// Upload timetable/schedule image to Gemini Multimodal Vision API
async function extractScheduleFromImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${CONFIG.AI_ASSISTANT_API_URL}/analyze/extract-schedule`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to extract schedule from image');
        }
        return await response.json();
    } catch (error) {
        console.error('Error extracting schedule from image:', error);
        throw error;
    }
}

// Synthesize complete day/week routine (Classes + Transit + Study + Gym + Sleep + Meals)
async function generateFullLifeSchedule(studentProfile, enrolledClasses) {
    try {
        const payload = {
            student_profile: studentProfile,
            enrolled_classes: enrolledClasses
        };

        const response = await fetch(`${CONFIG.AI_ASSISTANT_API_URL}/analyze/full-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to generate full life schedule');
        }
        return await response.json();
    } catch (error) {
        console.error('Error generating full life schedule:', error);
        throw error;
    }
}
