// UI Rendering Layer

function renderCourseList(courses, containerId, onCourseSelect) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const countBadge = document.getElementById('course-count-badge');
    if (countBadge) countBadge.textContent = courses.length;

    if (courses.length === 0) {
        container.innerHTML = '<div class="empty-state">No courses loaded yet. Select from catalog or upload a schedule screenshot above.</div>';
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

function renderCalendar(weeklySchedule, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Check if any weekend classes exist
    const hasWeekend = (weeklySchedule['Saturday'] && weeklySchedule['Saturday'].length > 0) ||
                       (weeklySchedule['Sunday'] && weeklySchedule['Sunday'].length > 0);
    const activeDays = hasWeekend ? days : days.slice(0, 5);

    container.style.gridTemplateColumns = `repeat(${activeDays.length}, minmax(130px, 1fr))`;
    container.style.minWidth = `${activeDays.length * 130}px`;

    activeDays.forEach(day => {
        const col = document.createElement('div');
        col.className = 'day-column';
        
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        col.appendChild(header);
        
        const classes = weeklySchedule[day] || [];
        if (classes.length === 0) {
            const emptyBlock = document.createElement('div');
            emptyBlock.style.cssText = 'border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; padding: 20px 8px; text-align: center; color: #64748b; font-size: 0.75rem;';
            emptyBlock.textContent = 'No classes';
            col.appendChild(emptyBlock);
        } else {
            classes.forEach(cls => {
                const classBlock = document.createElement('div');
                classBlock.className = 'scheduled-class';
                classBlock.innerHTML = `
                    <div style="font-weight: 700; color: #a5b4fc; font-size: 0.85rem; margin-bottom: 2px;">
                        🎓 ${cls.course_id}
                    </div>
                    ${cls.title ? `<div style="font-size: 0.8rem; color: #f8fafc; font-weight: 500; margin-bottom: 4px; line-height: 1.25;">${cls.title}</div>` : ''}
                    <div style="font-size: 0.75rem; color: #cbd5e1; display: flex; align-items: center; gap: 4px;">
                        <span style="opacity: 0.8;">🕒</span> ${cls.start_time} - ${cls.end_time}
                    </div>
                    <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 3px;">
                        <span>📍</span> <span>${cls.location || 'Campus'}</span>
                    </div>
                `;
                col.appendChild(classBlock);
            });
        }
        
        container.appendChild(col);
    });
}

function renderFullRoutineCalendar(weeklyRoutine, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    container.style.gridTemplateColumns = `repeat(7, minmax(140px, 1fr))`;
    container.style.minWidth = `980px`;

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
        header.textContent = day;
        col.appendChild(header);
        
        const activities = weeklyRoutine[day] || [];
        activities.forEach(act => {
            const block = document.createElement('div');
            const typeKey = (act.activity_type || 'Personal').toLowerCase();
            block.className = `scheduled-block ${typeKey}`;
            
            const icon = typeIcons[act.activity_type] || '📌';

            block.innerHTML = `
                <div style="font-weight: 600; display:flex; align-items:flex-start; gap:6px; margin-bottom:4px; font-size:0.82rem; color:#f8fafc;">
                    <span style="font-size:1rem; flex-shrink:0;">${icon}</span>
                    <span style="word-break:normal; overflow-wrap:anywhere; line-height:1.25;">${act.title || act.activity_type}</span>
                </div>
                <div style="font-size:0.75rem; color:#cbd5e1; font-weight:500; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
                    <span style="opacity:0.75;">🕒</span> ${act.start_time} - ${act.end_time}
                </div>
                ${act.location ? `<div style="font-size:0.72rem; color:#94a3b8; margin-top:2px; display:flex; align-items:center; gap:3px;"><span>📍</span><span>${act.location}</span></div>` : ''}
                ${act.description ? `<div style="font-size:0.72rem; color:#94a3b8; margin-top:3px; line-height:1.25; font-style:italic;">${act.description}</div>` : ''}
            `;
            col.appendChild(block);
        });
        
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
