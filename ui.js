// UI Rendering Layer

function renderCourseList(courses, containerId, onCourseSelect) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const countBadge = document.getElementById('course-count-badge');
    if (countBadge) countBadge.textContent = courses.length;

    if (courses.length === 0) {
        container.innerHTML = '<div class="empty-state">No courses added. Upload a schedule screenshot or select from catalog.</div>';
        return;
    }

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.dataset.id = course.course_id;
        
        card.innerHTML = `
            <div class="course-id">${course.course_id}</div>
            <div class="course-title">${course.title || course.course_id} ${course.credits ? `(${course.credits} cr)` : ''}</div>
            ${course.day && course.start_time ? `<div style="font-size:0.75rem; color: #94a3b8; margin-top:3px;">${course.day} ${course.start_time}-${course.end_time}</div>` : ''}
        `;
        
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            onCourseSelect(course.course_id, card.classList.contains('selected'));
        });
        
        container.appendChild(card);
    });
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 360;
    const parts = timeStr.trim().split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
}

function renderTimeAxisCol() {
    const col = document.createElement('div');
    col.className = 'time-axis-col';

    const header = document.createElement('div');
    header.className = 'time-axis-header';
    col.appendChild(header);

    const body = document.createElement('div');
    body.className = 'time-axis-body';

    // 06:00 to 24:00 (18 hours)
    for (let h = 6; h <= 24; h++) {
        const label = document.createElement('div');
        label.className = 'time-axis-label';
        const topPx = (h - 6) * 72;
        label.style.top = `${topPx}px`;
        label.textContent = `${h.toString().padStart(2, '0')}:00`;
        body.appendChild(label);
    }

    col.appendChild(body);
    return col;
}

function renderCalendar(weeklySchedule, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Always render 48px time-axis + 7 days Monday - Sunday with no horizontal scroll
    container.style.gridTemplateColumns = '48px repeat(7, minmax(0, 1fr))';
    container.style.minWidth = '0';

    // 1. Time axis column
    container.appendChild(renderTimeAxisCol());

    // 2. Day columns (Monday - Sunday)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShortNames = {
        'Monday': 'Mon',
        'Tuesday': 'Tue',
        'Wednesday': 'Wed',
        'Thursday': 'Thu',
        'Friday': 'Fri',
        'Saturday': 'Sat',
        'Sunday': 'Sun'
    };

    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'day-column';

        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = dayShortNames[day] || day;
        header.title = day;
        col.appendChild(header);

        const body = document.createElement('div');
        body.className = 'day-body';

        const classes = weeklySchedule[day] || [];
        classes.forEach(cls => {
            const startMins = timeToMinutes(cls.start_time);
            const endMins = timeToMinutes(cls.end_time);

            // Scale: 1.2px per minute, base 06:00 (360 mins)
            const topPx = Math.max(0, (startMins - 360) * 1.2);
            const durationMins = Math.max(15, endMins - startMins);
            const heightPx = Math.max(22, durationMins * 1.2);

            const block = document.createElement('div');
            block.className = 'scheduled-class';
            block.style.top = `${topPx}px`;
            block.style.height = `${heightPx}px`;

            if (durationMins < 30) {
                block.classList.add('block-compact');
                block.innerHTML = `
                    <span>🎓</span>
                    <span class="block-title">${cls.course_id}</span>
                    <span class="block-time">${cls.start_time}</span>
                `;
            } else {
                block.innerHTML = `
                    <div class="block-header">
                        <span class="block-icon">🎓</span>
                        <div class="block-title">${cls.course_id} ${cls.title ? `— ${cls.title}` : ''}</div>
                    </div>
                    <div class="block-time">${cls.start_time} - ${cls.end_time}</div>
                    ${cls.location && heightPx > 50 ? `<div class="block-meta">📍 ${cls.location}</div>` : ''}
                `;
            }

            body.appendChild(block);
        });

        col.appendChild(body);
        container.appendChild(col);
    });
}

function renderFullRoutineCalendar(weeklyRoutine, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Always render 48px time-axis + 7 days Monday - Sunday with no horizontal scroll
    container.style.gridTemplateColumns = '48px repeat(7, minmax(0, 1fr))';
    container.style.minWidth = '0';

    // 1. Time axis column
    container.appendChild(renderTimeAxisCol());

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShortNames = {
        'Monday': 'Mon',
        'Tuesday': 'Tue',
        'Wednesday': 'Wed',
        'Thursday': 'Thu',
        'Friday': 'Fri',
        'Saturday': 'Sat',
        'Sunday': 'Sun'
    };

    const typeIcons = {
        'Class': '🎓',
        'Transit': '🚗',
        'Study': '📚',
        'Gym': '🏋️',
        'Wakeup': '⏰',
        'Sleep': '🌙',
        'Meal': '🍽️',
        'Personal': '☕'
    };

    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'day-column';

        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = dayShortNames[day] || day;
        header.title = day;
        col.appendChild(header);

        const body = document.createElement('div');
        body.className = 'day-body';

        const activities = weeklyRoutine[day] || [];
        let overnightSleepBlock = null;

        activities.forEach(act => {
            const typeKey = (act.activity_type || 'Personal').toLowerCase();
            const startMins = timeToMinutes(act.start_time);
            const endMins = timeToMinutes(act.end_time);

            // Collapse overnight sleep (e.g. 23:00 - 07:00 or starting >= 22:00 / sleep type)
            if (typeKey === 'sleep' || (startMins >= 1320 && endMins <= 480)) {
                overnightSleepBlock = act;
                return; // Pin into bottom banner instead of taking 8 hours of grid space
            }

            // Proportional vertical positioning (base 06:00 = 360 mins, 1.2px/min)
            const topPx = Math.max(0, (startMins - 360) * 1.2);
            const durationMins = Math.max(10, endMins - startMins);
            const heightPx = Math.max(22, durationMins * 1.2);

            const block = document.createElement('div');
            block.className = `scheduled-block ${typeKey}`;
            block.style.top = `${topPx}px`;
            block.style.height = `${heightPx}px`;

            const icon = typeIcons[act.activity_type] || '📌';

            // Micro-blocks (< 30 mins)
            if (durationMins < 30) {
                block.classList.add('block-compact');
                block.innerHTML = `
                    <span>${icon}</span>
                    <span class="block-title">${act.title || act.activity_type}</span>
                    <span class="block-time">${act.start_time}</span>
                `;
            } else {
                // Standard/Large blocks (>= 30 mins)
                block.innerHTML = `
                    <div class="block-header">
                        <span class="block-icon">${icon}</span>
                        <div class="block-title">${act.title || act.activity_type}</div>
                    </div>
                    <div class="block-time">${act.start_time} - ${act.end_time}</div>
                    ${act.location && heightPx > 45 ? `<div class="block-meta">📍 ${act.location}</div>` : ''}
                `;
            }

            body.appendChild(block);
        });

        // Add pinned overnight sleep banner at the bottom of the day column
        if (overnightSleepBlock) {
            const sleepBanner = document.createElement('div');
            sleepBanner.className = 'sleep-banner';
            sleepBanner.innerHTML = `<span>🌙 Sleep</span> <span>${overnightSleepBlock.start_time} - ${overnightSleepBlock.end_time}</span>`;
            body.appendChild(sleepBanner);
        }

        col.appendChild(body);
        container.appendChild(col);
    });
}

function renderAIInsights(insights, containerId) {
    const container = document.getElementById(containerId);
    
    if (!insights) {
        container.innerHTML = '<div class="empty-state">Generate a schedule to see AI insights.</div>';
        return;
    }
    
    let html = `
        <div class="insight-card summary">
            <h3>📝 Routine Analysis & Summary</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${insights.summary}</p>
        </div>
    `;
    
    if (insights.warnings && insights.warnings.length > 0) {
        let listItems = insights.warnings.map(w => `<li>${w}</li>`).join('');
        html += `
            <div class="insight-card warning">
                <h3>⚠️ Potential Workload / Transit Conflicts</h3>
                <ul class="insight-list">${listItems}</ul>
            </div>
        `;
    }
    
    if (insights.suggestions && insights.suggestions.length > 0) {
        let listItems = insights.suggestions.map(s => `<li>${s}</li>`).join('');
        html += `
            <div class="insight-card suggestion">
                <h3>💡 Productivity & Lifestyle Recommendations</h3>
                <ul class="insight-list">${listItems}</ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}
