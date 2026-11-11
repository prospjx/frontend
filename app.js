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
    currentView: 'classes', // 'routine' or 'classes'
    diagnosticQuestions: [],
    diagnosticAnswers: {}, // key: question_id, val: string answer
    currentAiTab: 'coach' // 'coach' or 'insights'
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
    const prefEnergyChronotypeSelect = document.getElementById('pref-energy-chronotype');
    const prefStudyStyleSelect = document.getElementById('pref-study-style');
    const prefMinGapCommuteInput = document.getElementById('pref-min-gap-commute');

    // Upload & Actions
    const dropzone = document.getElementById('dropzone');
    const scheduleFileInput = document.getElementById('schedule-file-input');
    const uploadStatus = document.getElementById('upload-status');
    const generateLifeBtn = document.getElementById('generate-life-btn');
    const studentNameEl = document.getElementById('student-name');

    // View Toggles
    const viewRoutineBtn = document.getElementById('view-routine-btn');
    const viewClassesBtn = document.getElementById('view-classes-btn');
    const calendarViewTitle = document.getElementById('calendar-view-title');

    // Right Panel AI Coach & Insights 2-Tab Switcher
    const aiTabCoachBtn = document.getElementById('ai-tab-coach-btn');
    const aiTabInsightsBtn = document.getElementById('ai-tab-insights-btn');
    const aiPaneCoach = document.getElementById('ai-pane-coach');
    const aiPaneInsights = document.getElementById('ai-pane-insights');
    const aiChatThread = document.getElementById('ai-chat-thread');
    const startCheckinBtn = document.getElementById('start-checkin-btn');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiSendReplyBtn = document.getElementById('ai-send-reply-btn');
    const aiBuildPlanBtn = document.getElementById('ai-build-plan-btn');

    // Theme Toggle (Light theme by default, optional dark mode toggle)
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
            if (themeToggleBtn) themeToggleBtn.title = 'Switch to Light Theme';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
            if (themeToggleBtn) themeToggleBtn.title = 'Switch to Dark Theme';
        }
        localStorage.setItem('scs_theme', theme);
    }

    // Default to 'light' theme
    const savedTheme = localStorage.getItem('scs_theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // -------------------------------------------------------------
    // Collapsible Panels (Left Sidebar & Right AI Panel)
    // -------------------------------------------------------------
    const appContainer = document.querySelector('.app-container');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const aiPanelCollapseBtn = document.getElementById('ai-panel-collapse-btn');
    const aiPanelToggleBtn = document.getElementById('ai-panel-toggle-btn');

    function toggleSidebar(forceState) {
        if (!appContainer) return;
        const willCollapse = typeof forceState === 'boolean' 
            ? forceState 
            : !appContainer.classList.contains('sidebar-collapsed');
        
        if (willCollapse) {
            appContainer.classList.add('sidebar-collapsed');
            if (sidebarToggleBtn) sidebarToggleBtn.classList.remove('hidden');
        } else {
            appContainer.classList.remove('sidebar-collapsed');
            if (sidebarToggleBtn) sidebarToggleBtn.classList.add('hidden');
        }
    }

    function toggleAiPanel(forceState) {
        if (!appContainer) return;
        const willCollapse = typeof forceState === 'boolean'
            ? forceState
            : !appContainer.classList.contains('ai-collapsed');

        if (willCollapse) {
            appContainer.classList.add('ai-collapsed');
            if (aiPanelToggleBtn) {
                aiPanelToggleBtn.classList.add('active');
                aiPanelToggleBtn.title = 'Show AI Coach & Insights Panel';
            }
        } else {
            appContainer.classList.remove('ai-collapsed');
            if (aiPanelToggleBtn) {
                aiPanelToggleBtn.classList.remove('active');
                aiPanelToggleBtn.title = 'Hide AI Coach & Insights Panel';
            }
        }
    }

    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', () => toggleSidebar(true));
    }
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => toggleSidebar(false));
    }
    if (aiPanelCollapseBtn) {
        aiPanelCollapseBtn.addEventListener('click', () => toggleAiPanel(true));
    }
    if (aiPanelToggleBtn) {
        aiPanelToggleBtn.addEventListener('click', () => toggleAiPanel());
    }

    // Ordered AI Schedule Builder Elements
    const extractedClassesList = document.getElementById('extracted-classes-list');
    const classCounterBadge = document.getElementById('class-counter-badge');
    const editPrefsQuickBtn = document.getElementById('edit-prefs-quick-btn');

    // Preference Summary Elements
    const summaryChronotype = document.getElementById('summary-chronotype');
    const summaryStudyStyle = document.getElementById('summary-study-style');
    const summarySleepWindow = document.getElementById('summary-sleep-window');
    const summaryGym = document.getElementById('summary-gym');

    function updateClassCounter() {
        if (!classCounterBadge) return;
        const count = state.extractedClasses ? state.extractedClasses.length : 0;
        classCounterBadge.textContent = `${count} ${count === 1 ? 'Class' : 'Classes'}`;
    }

    function updatePreferenceSummaryCard(profile) {
        if (!profile || !profile.preferences) return;
        const p = profile.preferences;
        
        const chronoLabels = {
            'morning_lark': 'Morning Lark 🌅',
            'afternoon_peak': 'Afternoon Peak ☀️',
            'night_owl': 'Night Owl 🦉'
        };
        const styleLabels = {
            'pomodoro': 'Pomodoro ⏱️',
            'deep_work': 'Deep Work 🧠'
        };

        if (summaryChronotype) summaryChronotype.textContent = chronoLabels[p.energy_chronotype] || p.energy_chronotype || 'Morning Lark 🌅';
        if (summaryStudyStyle) summaryStudyStyle.textContent = styleLabels[p.study_session_style] || p.study_session_style || 'Deep Work 🧠';
        if (summarySleepWindow) summarySleepWindow.textContent = `${p.wake_up_time || '07:00'} – ${p.sleep_time || '23:00'}`;
        if (summaryGym) {
            const gymT = (p.gym_time_preference || 'none').toLowerCase();
            summaryGym.textContent = gymT === 'none' ? 'No Gym' : `${p.gym_time_preference} (${p.gym_duration_minutes || 60}m)`;
        }
    }

    if (editPrefsQuickBtn) {
        editPrefsQuickBtn.addEventListener('click', () => {
            populatePrefForm(state.studentProfile);
            prefModal.classList.remove('hidden');
        });
    }

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
        prefEnergyChronotypeSelect.value = prefs.energy_chronotype || 'morning_lark';
        prefStudyStyleSelect.value = prefs.study_session_style || 'deep_work';
        prefMinGapCommuteInput.value = prefs.min_gap_for_commute_hours ?? 3;

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
                gym_duration_minutes: parseInt(prefGymDurationInput.value, 10),
                energy_chronotype: prefEnergyChronotypeSelect.value,
                study_session_style: prefStudyStyleSelect.value,
                min_gap_for_commute_hours: parseInt(prefMinGapCommuteInput.value, 10)
            }
        };

        prefStatus.textContent = 'Saving preferences to Student API...';
        prefStatus.className = 'pref-status';

        try {
            const saved = await updateStudentProfile(CONFIG.DEFAULT_STUDENT_ID, updatedProfile);
            state.studentProfile = saved;
            studentNameEl.textContent = `Student: ${saved.name}`;
            updateCreditCounter();
            updatePreferenceSummaryCard(saved);
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
            // Clear any prior routine plan so full-day routine stays clean until synthesized
            state.lastWeeklyRoutine = {};

            // Automatically switch toggle to "Classes Only" view mode
            state.currentView = 'classes';
            viewClassesBtn.classList.add('active');
            viewRoutineBtn.classList.remove('active');
            calendarViewTitle.textContent = "Academic Classes Only";
            renderCalendar(extractedWeekly, 'calendar-grid');

            // Render extracted classes into Step 2 list
            state.loadedCourses = extractedCoursesList;
            updateClassCounter();
            renderCourseList(state.loadedCourses, 'extracted-classes-list', (courseId, isSelected) => {
                if (isSelected) state.selectedCourses.add(courseId);
                else state.selectedCourses.delete(courseId);
            });

            // Automatically trigger AI Coach diagnostic check-in flow!
            await startDiagnosticCheckIn();

        } catch (err) {
            uploadStatus.textContent = `Extraction failed: ${err.message}`;
            uploadStatus.className = 'upload-status error';
        }
    }

    // -------------------------------------------------------------
    // 5. Right Panel AI Coach & Insights Tab Switcher
    // -------------------------------------------------------------
    function switchAiPanelTab(tab) {
        state.currentAiTab = tab;
        if (tab === 'coach') {
            aiTabCoachBtn.classList.add('active');
            aiTabInsightsBtn.classList.remove('active');
            aiPaneCoach.classList.remove('hidden');
            aiPaneInsights.classList.add('hidden');
        } else {
            aiTabInsightsBtn.classList.add('active');
            aiTabCoachBtn.classList.remove('active');
            aiPaneInsights.classList.remove('hidden');
            aiPaneCoach.classList.add('hidden');
        }
    }

    aiTabCoachBtn.addEventListener('click', () => switchAiPanelTab('coach'));
    aiTabInsightsBtn.addEventListener('click', () => switchAiPanelTab('insights'));

    // Helper: get classes to schedule from extracted classes, weekly schedule, or selected courses
    function getClassesToSchedule() {
        let classes = state.extractedClasses;
        if (!classes || classes.length === 0) {
            classes = [];
            for (const [day, dayClasses] of Object.entries(state.lastWeeklySchedule)) {
                dayClasses.forEach(c => {
                    classes.push({
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

        // Fallback: if student selected courses from the catalog list but hasn't run optimizer yet
        if (classes.length === 0 && state.selectedCourses.size > 0) {
            state.loadedCourses.forEach(c => {
                if (state.selectedCourses.has(c.course_id)) {
                    if (c.sections && c.sections.length > 0) {
                        const sec = c.sections[0];
                        (sec.days || ['Monday', 'Wednesday', 'Friday']).forEach(day => {
                            classes.push({
                                course_id: c.course_id,
                                title: c.title || c.course_id,
                                day: day,
                                start_time: sec.start_time || '10:00',
                                end_time: sec.end_time || '11:15',
                                location: sec.location || 'Hall A'
                            });
                        });
                    }
                }
            });
        }

        return classes;
    }

    // Helper: append a message to the AI chat thread
    function appendChatMessage(sender, text, options = {}) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        if (options.isGreeting) bubble.classList.add('ai-greeting');

        if (options.observation) {
            const obsEl = document.createElement('div');
            obsEl.className = 'ai-observation';
            obsEl.textContent = options.observation;
            bubble.appendChild(obsEl);
        }

        if (text) {
            const textEl = document.createElement('div');
            textEl.className = options.isQuestion ? 'ai-question' : '';
            textEl.textContent = text;
            bubble.appendChild(textEl);
        }

        msgDiv.appendChild(bubble);

        // Render Quick-Reply pills if question has quick_replies
        if (options.quickReplies && options.quickReplies.length > 0 && options.questionId) {
            const pillsDiv = document.createElement('div');
            pillsDiv.className = 'quick-replies-group';
            pillsDiv.dataset.questionId = options.questionId;

            options.quickReplies.forEach(reply => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'quick-reply-chip';
                chip.textContent = reply;

                chip.addEventListener('click', () => {
                    // Deselect siblings in this group
                    pillsDiv.querySelectorAll('.quick-reply-chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    // Store in diagnosticAnswers
                    state.diagnosticAnswers[options.questionId] = reply;
                });

                pillsDiv.appendChild(chip);
            });

            msgDiv.appendChild(pillsDiv);
        }

        aiChatThread.appendChild(msgDiv);
        aiChatThread.scrollTop = aiChatThread.scrollHeight;
        return msgDiv;
    }

    // -------------------------------------------------------------
    // 6. Interactive Diagnostic Check-In Flow
    // -------------------------------------------------------------
    async function startDiagnosticCheckIn() {
        switchAiPanelTab('coach');

        if (!state.studentProfile) {
            state.studentProfile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
        }

        const classesToSchedule = getClassesToSchedule();
        if (classesToSchedule.length === 0) {
            aiChatThread.innerHTML = `
                <div class="chat-msg ai">
                    <div class="chat-bubble ai">
                        👋 Hi! Please upload a schedule screenshot or select courses on the left first so I can inspect your timetable.
                    </div>
                </div>
            `;
            return;
        }

        // Clear thread and show loading indicator
        aiChatThread.innerHTML = `
            <div class="chat-msg ai" id="ai-loading-bubble">
                <div class="chat-bubble ai">
                    🔍 Analyzing your timetable and preparing your personalized routine check-in...
                </div>
            </div>
        `;

        try {
            const response = await fetchDiagnosticCheckIn(state.studentProfile, classesToSchedule);
            aiChatThread.innerHTML = ''; // Remove loading

            // Render Greeting & Empathic Observation
            appendChatMessage('ai', '', {
                observation: `💬 ${response.greeting_observation}`,
                isGreeting: true
            });

            // Store questions and render each question with quick-reply chips
            state.diagnosticQuestions = response.questions || [];
            state.diagnosticAnswers = {};

            state.diagnosticQuestions.forEach((q, idx) => {
                appendChatMessage('ai', `${idx + 1}. ${q.question_text}`, {
                    isQuestion: true,
                    questionId: q.id,
                    quickReplies: q.quick_replies
                });
            });

        } catch (err) {
            aiChatThread.innerHTML = `
                <div class="chat-msg ai">
                    <div class="chat-bubble ai" style="border-color: var(--accent-rose); color: var(--accent-rose);">
                        ⚠️ Could not start diagnostic check-in: ${err.message}. You can still build your plan directly using your default preferences!
                    </div>
                </div>
            `;
        }
    }

    if (startCheckinBtn) {
        startCheckinBtn.addEventListener('click', startDiagnosticCheckIn);
    }
    // Also delegate on aiChatThread in case empty state is restored
    aiChatThread.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'start-checkin-btn' || e.target.closest('#start-checkin-btn'))) {
            startDiagnosticCheckIn();
        }
    });

    // Send custom reply from chat input bar
    function handleCustomUserReply() {
        const text = aiChatInput.value.trim();
        if (!text) return;

        appendChatMessage('user', text);
        aiChatInput.value = '';

        // If there are questions that don't have an answer yet, assign this text to the first unanswered question
        if (state.diagnosticQuestions && state.diagnosticQuestions.length > 0) {
            const unanswered = state.diagnosticQuestions.find(q => !state.diagnosticAnswers[q.id]);
            if (unanswered) {
                state.diagnosticAnswers[unanswered.id] = text;
            } else {
                // Attach as a general note or follow-up
                state.diagnosticAnswers['custom_followup'] = text;
            }
        }
    }

    aiSendReplyBtn.addEventListener('click', handleCustomUserReply);
    aiChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCustomUserReply();
        }
    });

    // -------------------------------------------------------------
    // 7. Full Day / Week Life Routine Synthesis & Follow-up
    // -------------------------------------------------------------
    async function triggerFullLifeRoutine() {
        if (!state.studentProfile) {
            state.studentProfile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
        }

        const originalBtnText = aiBuildPlanBtn.textContent;
        aiBuildPlanBtn.textContent = 'Synthesizing 7-Day Plan...';
        aiBuildPlanBtn.disabled = true;

        if (generateLifeBtn) {
            generateLifeBtn.textContent = 'Planning Routine...';
            generateLifeBtn.disabled = true;
        }

        // Immediately switch calendar view toggle to Full Day Routine while synthesizing
        state.currentView = 'routine';
        viewRoutineBtn.classList.add('active');
        viewClassesBtn.classList.remove('active');
        calendarViewTitle.textContent = "Weekly Life & Routine Plan";

        document.getElementById('calendar-grid').innerHTML = '<div class="loading">Synthesizing full 24/7 weekly routine (Classes + Transit + Study + Gym + Sleep) via AI...</div>';

        try {
            const classesToSchedule = getClassesToSchedule();

            // Prepare diagnostic_answers array for POST /full-schedule
            let formattedAnswers = null;
            if (state.diagnosticQuestions && state.diagnosticQuestions.length > 0) {
                formattedAnswers = state.diagnosticQuestions.map(q => ({
                    question_id: q.id,
                    question_text: q.question_text,
                    answer: state.diagnosticAnswers[q.id] || "Default preference"
                }));

                // Include any custom write-in if provided
                if (state.diagnosticAnswers['custom_followup']) {
                    formattedAnswers.push({
                        question_id: 'custom_followup',
                        question_text: 'Student custom request',
                        answer: state.diagnosticAnswers['custom_followup']
                    });
                }
            }

            const lifeResponse = await generateFullLifeSchedule(
                state.studentProfile,
                classesToSchedule,
                formattedAnswers
            );

            state.lastWeeklyRoutine = lifeResponse.weekly_routine;
            state.lastAiInsights = lifeResponse.ai_insights;

            // Switch calendar view to 7-Day Routine
            state.currentView = 'routine';
            viewRoutineBtn.classList.add('active');
            viewClassesBtn.classList.remove('active');
            calendarViewTitle.textContent = "Weekly Life & Routine Plan";

            renderFullRoutineCalendar(state.lastWeeklyRoutine, 'calendar-grid');
            renderAIInsights(state.lastAiInsights, 'ai-insights-content');

            // Post completion message in AI chat
            appendChatMessage('ai', "🎉 Your personalized 7-day routine plan is ready! I've scheduled your transit buffers, subject-specific study sessions, fitness, and downtime around your classes. Check the 📊 Insights & Warnings tab for workload analysis or type below if you'd like any tweaks!");

        } catch (err) {
            alert(`Error generating full life routine: ${err.message}`);
            if (Object.keys(state.lastWeeklySchedule).length > 0) {
                renderCalendar(state.lastWeeklySchedule, 'calendar-grid');
            }
        } finally {
            aiBuildPlanBtn.textContent = originalBtnText;
            aiBuildPlanBtn.disabled = false;
            if (generateLifeBtn) {
                generateLifeBtn.textContent = '✨ Generate Full Routine Plan';
                generateLifeBtn.disabled = false;
            }
        }
    }

    aiBuildPlanBtn.addEventListener('click', triggerFullLifeRoutine);
    if (generateLifeBtn) {
        generateLifeBtn.addEventListener('click', async () => {
            // If diagnostic hasn't been run, start check-in; otherwise generate routine
            if (state.diagnosticQuestions.length === 0) {
                await startDiagnosticCheckIn();
            } else {
                await triggerFullLifeRoutine();
            }
        });
    }

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
            document.getElementById('calendar-grid').innerHTML = '<div class="empty-state">Complete the AI Coach check-in questions on the right to synthesize your full-day routine (Classes + Transit + Study + Gym + Sleep).</div>';
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
    // 7. Initial Data Fetch & Profile Initialization
    // -------------------------------------------------------------
    renderCalendar({}, 'calendar-grid');

    const profile = await fetchStudentProfile(CONFIG.DEFAULT_STUDENT_ID);
    if (profile) {
        state.studentProfile = profile;
        studentNameEl.textContent = `Student: ${profile.name}`;
        updatePreferenceSummaryCard(profile);
    }
});
