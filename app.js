// Main Application Controller

const state = {
    selectedCourses: new Set(),
    studentProfile: null
};

document.addEventListener('DOMContentLoaded', async () => {
    const generateBtn = document.getElementById('generate-btn');
    const studentNameEl = document.getElementById('student-name');
    
    // Initial UI Setup (Draw empty calendar)
    renderCalendar({}, 'calendar-grid');

    // 1. Fetch and render available courses
    const courses = await fetchCourses();
    renderCourseList(courses, 'course-list', (courseId, isSelected) => {
        if (isSelected) {
            state.selectedCourses.add(courseId);
        } else {
            state.selectedCourses.delete(courseId);
        }
        
        generateBtn.disabled = state.selectedCourses.size === 0;
    });

    // 2. Fetch mock student profile
    const profile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
    if (profile) {
        state.studentProfile = profile;
        studentNameEl.textContent = `Student: ${profile.name}`;
    } else {
        studentNameEl.textContent = `Please start the backend APIs`;
    }

    // 3. Handle Generate Button Click
    generateBtn.addEventListener('click', async () => {
        if (state.selectedCourses.size === 0) return;
        
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
        
        document.getElementById('calendar-grid').innerHTML = '<div class="loading">Generating schedule via AI...</div>';
        
        try {
            const courseIdsArray = Array.from(state.selectedCourses);
            const scheduleResponse = await generateSchedule(CONFIG.DEFAULT_STUDENT_ID, courseIdsArray);
            
            // Render the returned schedule
            renderCalendar(scheduleResponse.weekly_schedule, 'calendar-grid');
            
            // Render the AI Insights
            renderAIInsights(scheduleResponse.ai_insights, 'ai-insights-content');
            
        } catch (error) {
            alert(`Error: ${error.message}`);
            renderCalendar({}, 'calendar-grid');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    });
});
