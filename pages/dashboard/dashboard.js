// Dashboard-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    checkForAlerts();
    setupQuickActions();
});

function loadDashboardData() {
    updateDashboardStats();
    loadRecentActivity();
}

function updateDashboardStats() {
    const today = new Date().toDateString();
    const todayVisits = visitLogs.filter(visit => 
        new Date(visit.dateTime).toDateString() === today
    ).length;
    
    const pendingTreatments = visitLogs.filter(visit => 
        visit.status === 'pending' || visit.status === 'urgent'
    ).length;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards[0]) statCards[0].textContent = todayVisits;
    if (statCards[1]) statCards[1].textContent = studentRecords.length;
    if (statCards[2]) statCards[2].textContent = pendingTreatments;
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    // Get recent visit logs
    const recentVisits = [...visitLogs]
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        .slice(0, 5);

    activityList.innerHTML = recentVisits.map(visit => `
        <div class="activity-item">
            <i class="fas fa-${visit.urgency === 'urgent' ? 'exclamation-circle' : 'clipboard-check'} activity-icon"></i>
            <div>
                <p>${visit.studentName} (${visit.gradeSection}) - ${visit.complaint}</p>
                <small>${getTimeAgo(visit.dateTime)}</small>
            </div>
        </div>
    `).join('');
}

function searchStudent() {
    const searchInput = document.getElementById('studentSearch');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (!query) {
        showAlert('Please enter a search term', 'warning');
        return;
    }

    const results = searchStudents(query);
    if (results.length === 0) {
        showAlert('No students found', 'info');
        return;
    }

    // Show results in a modal
    const content = `
        <div class="search-results">
            ${results.map(student => `
                <div class="search-result-item" onclick="showStudentDetails('${student.lrn}')">
                    <h3>${student.fullName}</h3>
                    <p>LRN: ${student.lrn}</p>
                    <p>Grade & Section: ${student.gradeSection}</p>
                </div>
            `).join('')}
        </div>
    `;

    const modal = createModal('Search Results', content);
    showModal(modal);
}

function showStudentDetails(lrn) {
    const student = getStudentByLRN(lrn);
    if (!student) {
        showAlert('Student not found', 'error');
        return;
    }

    const recentVisits = getVisitsByStudent(lrn)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        .slice(0, 3);

    const content = `
        <div class="student-details">
            <div class="student-info">
                <h3>${student.fullName}</h3>
                <p><strong>LRN:</strong> ${student.lrn}</p>
                <p><strong>Grade & Section:</strong> ${student.gradeSection}</p>
                <p><strong>Date of Birth:</strong> ${formatDate(student.dateOfBirth)}</p>
                <p><strong>Guardian:</strong> ${student.guardianName}</p>
                <p><strong>Contact:</strong> ${student.guardianPhone}</p>
            </div>
            <div class="medical-info">
                <h4>Medical History</h4>
                <p>${student.medicalHistory.length ? student.medicalHistory.join(', ') : 'No known conditions'}</p>
                <h4>Recent Visits</h4>
                ${recentVisits.length ? recentVisits.map(visit => `
                    <div class="visit-item">
                        <p><strong>${formatDate(visit.dateTime)}:</strong> ${visit.complaint}</p>
                        <p><em>Treatment:</em> ${visit.treatment}</p>
                    </div>
                `).join('') : '<p>No recent visits</p>'}
            </div>
        </div>
    `;

    const buttons = [
        {
            text: 'New Visit',
            class: 'btn-primary',
            onClick: `showNewVisitModal('${student.lrn}')`
        },
        {
            text: 'Edit Record',
            class: 'btn-secondary',
            onClick: `window.location.href='../student-records/index.html?lrn=${student.lrn}'`
        }
    ];

    const modal = createModal('Student Details', content, buttons);
    showModal(modal);
}

function checkForAlerts() {
    // Check for low stock medications
    const lowStockMeds = medications.filter(med => med.stock <= med.lowStockThreshold);
    lowStockMeds.forEach(med => {
        showAlert(`Low stock alert: ${med.name} (${med.stock} ${med.unit} remaining)`, 'warning');
    });
    
    // Check for expiring medications
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringMeds = medications.filter(med => 
        new Date(med.expiry) <= thirtyDaysFromNow && 
        new Date(med.expiry) > new Date()
    );
    
    expiringMeds.forEach(med => {
        showAlert(`${med.name} expires on ${formatDate(med.expiry)}`, 'warning');
    });
}

// Quick Actions Functionality
function setupQuickActions() {
    // Add click event listeners to quick action buttons
    document.querySelectorAll('.quick-action').forEach(button => {
        button.addEventListener('click', handleQuickAction);
    });
}

function handleQuickAction(event) {
    const action = event.currentTarget.getAttribute('data-action');
    switch (action) {
        case 'new-visit':
            showNewVisitModal();
            break;
        case 'add-student':
            showAddStudentModal();
            break;
        case 'medications':
            window.location.href = '../medications/index.html';
            break;
        case 'reports':
            window.location.href = '../reports/index.html';
            break;
    }
}

function showNewVisitModal(studentLRN = '') {
    const content = `
        <form id="newVisitForm" class="visit-form" onsubmit="createNewVisit(event)">
            <div class="form-group">
                <label>Student LRN</label>
                <input type="text" id="visitStudentLRN" value="${studentLRN}" required ${studentLRN ? 'readonly' : ''}>
                ${!studentLRN ? '<button type="button" class="btn btn-secondary" onclick="searchStudentForVisit()">Search Student</button>' : ''}
            </div>
            <div class="form-group">
                <label>Complaint</label>
                <textarea id="visitComplaint" required></textarea>
            </div>
            <div class="form-group">
                <label>Initial Assessment</label>
                <textarea id="visitAssessment" required></textarea>
            </div>
            <div class="form-group">
                <label>Treatment</label>
                <textarea id="visitTreatment" required></textarea>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="visitStatus" required>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Save Visit',
            class: 'btn-primary',
            onClick: 'document.getElementById("newVisitForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('New Clinic Visit', content, buttons);
    showModal(modal);
}

function createNewVisit(event) {
    event.preventDefault();
    
    const studentLRN = document.getElementById('visitStudentLRN').value;
    const student = getStudentByLRN(studentLRN);
    
    if (!student) {
        showAlert('Student not found', 'error');
        return;
    }

    const newVisit = {
        id: generateId(),
        studentLRN: studentLRN,
        studentName: student.fullName,
        gradeSection: student.gradeSection,
        complaint: document.getElementById('visitComplaint').value,
        assessment: document.getElementById('visitAssessment').value,
        treatment: document.getElementById('visitTreatment').value,
        status: document.getElementById('visitStatus').value,
        dateTime: new Date().toISOString(),
        nurseId: currentUser.name
    };

    visitLogs.unshift(newVisit);
    showAlert('Visit recorded successfully', 'success');
    closeAllModals();
    loadDashboardData(); // Refresh dashboard data
}

function showAddStudentModal() {
    const content = `
        <form id="addStudentForm" class="student-form" onsubmit="createNewStudent(event)">
            <div class="form-group">
                <label>LRN (Learner Reference Number)</label>
                <input type="text" id="studentLRN" required pattern="[0-9]{12}" title="Please enter a valid 12-digit LRN">
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="studentName" required>
            </div>
            <div class="form-group">
                <label>Grade & Section</label>
                <input type="text" id="gradeSection" required placeholder="e.g., 8-A">
            </div>
            <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" id="dateOfBirth" required>
            </div>
            <div class="form-group">
                <label>Guardian Name</label>
                <input type="text" id="guardianName" required>
            </div>
            <div class="form-group">
                <label>Guardian Phone</label>
                <input type="tel" id="guardianPhone" required>
            </div>
            <div class="form-group">
                <label>Medical History (comma-separated)</label>
                <textarea id="medicalHistory" placeholder="e.g., Asthma, Allergies"></textarea>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Add Student',
            class: 'btn-primary',
            onClick: 'document.getElementById("addStudentForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Add New Student', content, buttons);
    showModal(modal);
}

function createNewStudent(event) {
    event.preventDefault();
    
    const lrn = document.getElementById('studentLRN').value;
    
    // Check if LRN already exists
    if (getStudentByLRN(lrn)) {
        showAlert('A student with this LRN already exists', 'error');
        return;
    }

    const newStudent = {
        lrn: lrn,
        fullName: document.getElementById('studentName').value,
        gradeSection: document.getElementById('gradeSection').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        guardianName: document.getElementById('guardianName').value,
        guardianPhone: document.getElementById('guardianPhone').value,
        medicalHistory: document.getElementById('medicalHistory').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
    };

    studentRecords.push(newStudent);
    showAlert('Student added successfully', 'success');
    closeAllModals();
    loadDashboardData(); // Refresh dashboard data
}

function searchStudentForVisit() {
    const content = `
        <div class="form-group">
            <input type="text" id="studentSearchInput" placeholder="Search by name or LRN..." 
                   onkeyup="performStudentSearch(event)">
        </div>
        <div id="searchResults" class="search-results"></div>
    `;

    const modal = createModal('Search Student', content);
    showModal(modal);
}

function performStudentSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        resultsContainer.innerHTML = '<p>Enter at least 2 characters to search</p>';
        return;
    }

    const results = studentRecords.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm) ||
        student.lrn.includes(searchTerm)
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No students found</p>';
        return;
    }

    resultsContainer.innerHTML = results.map(student => `
        <div class="search-result-item" onclick="selectStudentForVisit('${student.lrn}')">
            <h4>${student.fullName}</h4>
            <p>LRN: ${student.lrn}</p>
            <p>Grade & Section: ${student.gradeSection}</p>
        </div>
    `).join('');
}

function selectStudentForVisit(lrn) {
    closeAllModals();
    showNewVisitModal(lrn);
} 