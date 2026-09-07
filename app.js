// Main Application Controller

const state = {
    selectedCourses: new Set(),
    loadedCourses: [],
    extractedClasses: [],
    studentProfile: null,
    isAuthenticated: false,
    lastWeeklySchedule: {},
    lastWeeklyRoutine: {},
    lastAiInsights: null,
    currentView: 'classes' // 'routine' or 'classes'
};

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements - Auth
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // DOM Elements - Menu & Modals
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const menuStudentPrefs = document.getElementById('menu-student-prefs');
    const menuLogout = document.getElementById('menu-logout');

    const prefModal = document.getElementById('pref-modal');
    const closePrefBtn = document.getElementById('close-pref-btn');
    const cancelPrefBtn = document.getElementById('cancel-pref-btn');
    const prefForm = document.getElementById('pref-form');
    const prefStatus = document.getElementById('pref-status');

    // Preference Form Inputs
    const prefNameInput = document.getElementById('pref-name');
    const prefWakeTimeInput = document.getElementById('pref-wake-time');
    const prefSleepTimeInput = document.getElementById('pref-sleep-time');
    const prefTransitMinsInput = document.getElementById('pref-transit-mins');
    const prefStudyHoursInput = document.getElementById('pref-study-hours');
    const prefGymTimeSelect = document.getElementById('pref-gym-time');
    const prefGymDurationInput = document.getElementById('pref-gym-duration');
    const prefMaxCreditsInput = document.getElementById('pref-max-credits');
    const prefDifficultySelect = document.getElementById('pref-difficulty');

    // Upload & Actions
    const dropzone = document.getElementById('dropzone');
    const scheduleFileInput = document.getElementById('schedule-file-input');
    const uploadStatus = document.getElementById('upload-status');
    const generateBtn = document.getElementById('generate-btn');
    const generateLifeBtn = document.getElementById('generate-life-btn');
    const studentNameEl = document.getElementById('student-name');

    // View Toggles
    const viewRoutineBtn = document.getElementById('view-routine-btn');
    const viewClassesBtn = document.getElementById('view-classes-btn');
    const calendarViewTitle = document.getElementById('calendar-view-title');

    // -------------------------------------------------------------
    // 1. Authentication (admin / admin)
    // -------------------------------------------------------------
    const savedAuth = sessionStorage.getItem('scs_auth');
    if (savedAuth === 'true') {
        state.isAuthenticated = true;
        loginOverlay.classList.add('hidden');
    } else {
        loginOverlay.classList.remove('hidden');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (user === 'admin' && pass === 'admin') {
            state.isAuthenticated = true;
            sessionStorage.setItem('scs_auth', 'true');
            loginOverlay.classList.add('hidden');
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Invalid username or password. Use admin / admin.';
        }
    });

    // -------------------------------------------------------------
    // 2. 3-Stacked Menu & Logout
    // -------------------------------------------------------------
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    menuLogout.addEventListener('click', () => {
        sessionStorage.removeItem('scs_auth');
        state.isAuthenticated = false;
        dropdownMenu.classList.add('hidden');
        loginOverlay.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
    });

    // -------------------------------------------------------------
    // 3. Student Preferences Modal & Form
    // -------------------------------------------------------------
    function populatePrefForm(profile) {
        if (!profile) return;
        prefNameInput.value = profile.name || '';
        const prefs = profile.preferences || {};
        
        prefWakeTimeInput.value = prefs.wake_up_time || '07:00';
        prefSleepTimeInput.value = prefs.sleep_time || '23:00';
        prefTransitMinsInput.value = prefs.transit_time_minutes || 45;
        prefStudyHoursInput.value = prefs.study_hours_per_day || 3;
        prefGymTimeSelect.value = prefs.gym_time_preference || 'afternoon';
        prefGymDurationInput.value = prefs.gym_duration_minutes || 60;
        prefMaxCreditsInput.value = prefs.max_credits_per_term || 18;
        prefDifficultySelect.value = prefs.difficulty_tolerance || 'medium';

        const daysOff = prefs.preferred_days_off || [];
        document.querySelectorAll('input[name="days-off"]').forEach(cb => {
            cb.checked = daysOff.includes(cb.value);
        });
        prefStatus.textContent = '';
        prefStatus.className = 'pref-status';
    }

    menuStudentPrefs.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
        populatePrefForm(state.studentProfile);
        prefModal.classList.remove('hidden');
    });

    function closePrefModal() {
        prefModal.classList.add('hidden');
    }
    closePrefBtn.addEventListener('click', closePrefModal);
    cancelPrefBtn.addEventListener('click', closePrefModal);

    prefForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedDays = Array.from(document.querySelectorAll('input[name="days-off"]:checked')).map(cb => cb.value);

        const updatedProfile = {
            student_id: CONFIG.DEFAULT_STUDENT_ID,
            name: prefNameInput.value.trim(),
            preferences: {
                max_credits_per_term: parseInt(prefMaxCreditsInput.value, 10),
                preferred_days_off: selectedDays,
                difficulty_tolerance: prefDifficultySelect.value,
                preferred_time_of_day: state.studentProfile?.preferences?.preferred_time_of_day || 'any',
                wake_up_time: prefWakeTimeInput.value,
                sleep_time: prefSleepTimeInput.value,
                study_hours_per_day: parseInt(prefStudyHoursInput.value, 10),
                transit_time_minutes: parseInt(prefTransitMinsInput.value, 10),
                gym_time_preference: prefGymTimeSelect.value,
                gym_duration_minutes: parseInt(prefGymDurationInput.value, 10)
            }
        };

        prefStatus.textContent = 'Saving preferences to Student API...';
        prefStatus.className = 'pref-status';

        try {
            const saved = await updateStudentProfile(CONFIG.DEFAULT_STUDENT_ID, updatedProfile);
            state.studentProfile = saved;
            studentNameEl.textContent = `Student: ${saved.name}`;
            prefStatus.textContent = 'Preferences saved successfully!';
            prefStatus.className = 'pref-status success';

            setTimeout(() => {
                closePrefModal();
            }, 800);
        } catch (err) {
            prefStatus.textContent = `Failed to save: ${err.message}`;
            prefStatus.className = 'pref-status error';
        }
    });

    // -------------------------------------------------------------
    // 4. Screenshot Upload & Gemini Multimodal Extraction
    // -------------------------------------------------------------
    dropzone.addEventListener('click', () => {
        scheduleFileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.background = 'rgba(99, 102, 241, 0.15)';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = '';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.background = '';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleScreenshotUpload(e.dataTransfer.files[0]);
        }
    });

    scheduleFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleScreenshotUpload(e.target.files[0]);
        }
    });

    async function handleScreenshotUpload(file) {
        uploadStatus.textContent = `Analyzing image with Gemini Vision...`;
        uploadStatus.className = 'upload-status loading';

        try {
            const result = await extractScheduleFromImage(file);
            if (!result.success || !result.extracted_classes || result.extracted_classes.length === 0) {
                throw new Error(result.message || 'No courses detected in screenshot.');
            }

            state.extractedClasses = result.extracted_classes;
            uploadStatus.textContent = `Extracted ${result.extracted_classes.length} class timeslots!`;
            uploadStatus.className = 'upload-status success';

            // Convert extracted classes into timetable format
            const extractedWeekly = {
                'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []
            };

            const extractedCoursesList = [];
            const seenCourseIds = new Set();

            result.extracted_classes.forEach(c => {
                const day = c.day.charAt(0).toUpperCase() + c.day.slice(1).toLowerCase();
                if (extractedWeekly[day]) {
                    extractedWeekly[day].push({
                        course_id: c.course_id,
                        title: c.title,
                        start_time: c.start_time,
                        end_time: c.end_time,
                        location: c.location || 'Campus'
                    });
                }

                if (!seenCourseIds.has(c.course_id)) {
                    seenCourseIds.add(c.course_id);
                    extractedCoursesList.push({
                        course_id: c.course_id,
                        title: c.title,
                        credits: 3
                    });
                    state.selectedCourses.add(c.course_id);
                }
            });

            state.lastWeeklySchedule = extractedWeekly;
            renderCalendar(extractedWeekly, 'calendar-grid');

            // Add extracted courses to list
            state.loadedCourses = extractedCoursesList;
            renderCourseList(state.loadedCourses, 'course-list', (courseId, isSelected) => {
                if (isSelected) state.selectedCourses.add(courseId);
                else state.selectedCourses.delete(courseId);
                generateBtn.disabled = state.selectedCourses.size === 0;
            });
            generateBtn.disabled = false;

            // Automatically trigger full life routine synthesis with user's preferences!
            await triggerFullLifeRoutine();

        } catch (err) {
            uploadStatus.textContent = `Extraction failed: ${err.message}`;
            uploadStatus.className = 'upload-status error';
        }
    }

    // -------------------------------------------------------------
    // 5. Full Day / Week Life Routine Synthesis
    // -------------------------------------------------------------
    async function triggerFullLifeRoutine() {
        if (!state.studentProfile) {
            state.studentProfile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
        }

        const originalText = generateLifeBtn.textContent;
        generateLifeBtn.textContent = 'Planning Full Life Routine...';
        generateLifeBtn.disabled = true;

        document.getElementById('calendar-grid').innerHTML = '<div class="loading">Synthesizing full 24/7 weekly routine (Classes + Transit + Study + Gym + Sleep) via AI...</div>';

        try {
            // If classes were uploaded via image, use them; otherwise construct from selected catalog courses
            let classesToSchedule = state.extractedClasses;
            if (!classesToSchedule || classesToSchedule.length === 0) {
                // Build from current weekly schedule
                classesToSchedule = [];
                for (const [day, classes] of Object.entries(state.lastWeeklySchedule)) {
                    classes.forEach(c => {
                        classesToSchedule.push({
                            course_id: c.course_id,
                            title: c.title || c.course_id,
                            day: day,
                            start_time: c.start_time,
                            end_time: c.end_time,
                            location: c.location || 'Campus'
                        });
                    });
                }
            }

            const lifeResponse = await generateFullLifeSchedule(state.studentProfile, classesToSchedule);
            state.lastWeeklyRoutine = lifeResponse.weekly_routine;
            state.lastAiInsights = lifeResponse.ai_insights;

            // Switch view to routine
            state.currentView = 'routine';
            viewRoutineBtn.classList.add('active');
            viewClassesBtn.classList.remove('active');
            calendarViewTitle.textContent = "Weekly Life & Routine Plan";

            renderFullRoutineCalendar(state.lastWeeklyRoutine, 'calendar-grid');
            renderAIInsights(state.lastAiInsights, 'ai-insights-content');

        } catch (err) {
            alert(`Error generating full life routine: ${err.message}`);
            if (Object.keys(state.lastWeeklySchedule).length > 0) {
                renderCalendar(state.lastWeeklySchedule, 'calendar-grid');
            }
        } finally {
            generateLifeBtn.textContent = originalText;
            generateLifeBtn.disabled = false;
        }
    }

    generateLifeBtn.addEventListener('click', triggerFullLifeRoutine);

    // -------------------------------------------------------------
    // 6. View Toggles (Full Routine vs Classes Only)
    // -------------------------------------------------------------
    viewRoutineBtn.addEventListener('click', () => {
        state.currentView = 'routine';
        viewRoutineBtn.classList.add('active');
        viewClassesBtn.classList.remove('active');
        calendarViewTitle.textContent = "Weekly Life & Routine Plan";
        if (Object.keys(state.lastWeeklyRoutine).length > 0) {
            renderFullRoutineCalendar(state.lastWeeklyRoutine, 'calendar-grid');
        } else {
            document.getElementById('calendar-grid').innerHTML = '<div class="empty-state">Click "Generate Full Routine Plan" to view 24/7 schedule.</div>';
        }
    });

    viewClassesBtn.addEventListener('click', () => {
        state.currentView = 'classes';
        viewClassesBtn.classList.add('active');
        viewRoutineBtn.classList.remove('active');
        calendarViewTitle.textContent = "Academic Classes Only";
        renderCalendar(state.lastWeeklySchedule, 'calendar-grid');
    });

    // -------------------------------------------------------------
    // 7. Initial Data Fetch & Academic Course Optimization
    // -------------------------------------------------------------
    renderCalendar({}, 'calendar-grid');

    const courses = await fetchCourses();
    state.loadedCourses = courses;
    renderCourseList(courses, 'course-list', (courseId, isSelected) => {
        if (isSelected) {
            state.selectedCourses.add(courseId);
        } else {
            state.selectedCourses.delete(courseId);
        }
        generateBtn.disabled = state.selectedCourses.size === 0;
    });

    const profile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
    if (profile) {
        state.studentProfile = profile;
        studentNameEl.textContent = `Student: ${profile.name}`;
    }

    generateBtn.addEventListener('click', async () => {
        if (state.selectedCourses.size === 0) return;

        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Optimizing...';
        generateBtn.disabled = true;

        document.getElementById('calendar-grid').innerHTML = '<div class="loading">Optimizing academic schedule via AI...</div>';

        try {
            const courseIdsArray = Array.from(state.selectedCourses);
            const scheduleResponse = await generateSchedule(CONFIG.DEFAULT_STUDENT_ID, courseIdsArray);

            state.lastWeeklySchedule = scheduleResponse.weekly_schedule;
            state.lastAiInsights = scheduleResponse.ai_insights;

            state.currentView = 'classes';
            viewClassesBtn.classList.add('active');
            viewRoutineBtn.classList.remove('active');
            calendarViewTitle.textContent = "Academic Classes Only";

            renderCalendar(scheduleResponse.weekly_schedule, 'calendar-grid');
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
