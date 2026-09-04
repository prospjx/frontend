// UI Rendering Layer

function renderCourseList(courses, containerId, onCourseSelect) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (courses.length === 0) {
        container.innerHTML = '<div class="empty-state">Ensure Course API is running to see courses.</div>';
        return;
    }

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.dataset.id = course.course_id;
        
        card.innerHTML = `
            <div class="course-id">${course.course_id}</div>
            <div class="course-title">${course.title} (${course.credits} cr)</div>
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
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'day-column';
        
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        col.appendChild(header);
        
        const classes = weeklySchedule[day] || [];
        classes.forEach(cls => {
            const classBlock = document.createElement('div');
            classBlock.className = 'scheduled-class';
            classBlock.innerHTML = `
                <strong>${cls.course_id}</strong><br>
                ${cls.start_time} - ${cls.end_time}<br>
                <small>${cls.location}</small>
            `;
            col.appendChild(classBlock);
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
            <h3>📝 Summary</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">${insights.summary}</p>
        </div>
    `;
    
    if (insights.warnings && insights.warnings.length > 0) {
        let listItems = insights.warnings.map(w => `<li>${w}</li>`).join('');
        html += `
            <div class="insight-card warning">
                <h3>⚠️ Warnings</h3>
                <ul class="insight-list">${listItems}</ul>
            </div>
        `;
    }
    
    if (insights.suggestions && insights.suggestions.length > 0) {
        let listItems = insights.suggestions.map(s => `<li>${s}</li>`).join('');
        html += `
            <div class="insight-card suggestion">
                <h3>💡 Suggestions</h3>
                <ul class="insight-list">${listItems}</ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}
