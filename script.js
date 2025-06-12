// PDMHS Medical System - Complete JavaScript Implementation
// Author: System Developer
// Version: 1.0

// Global Variables and Data Storage
let studentRecords = [];
let visitLogs = [];
let dispensingLogs = [];
let medications = [
    {
        id: 1,
        name: "Paracetamol",
        stock: 150,
        unit: "tablets",
        expiry: "2025-12-31",
        lowStockThreshold: 50
    },
    {
        id: 2,
        name: "Ibuprofen",
        stock: 25,
        unit: "tablets",  
        expiry: "2026-01-31",
        lowStockThreshold: 50
    },
    {
        id: 3,
        name: "Antiseptic Solution",
        stock: 8,
        unit: "bottles",
        expiry: "2026-03-31",
        lowStockThreshold: 10
    }
];

let currentUser = {
    name: "Nurse Rivera",
    role: "School Clinic Staff",
    permissions: ["read", "write", "admin"]
};

// Sample student data for testing
function initializeSampleData() {
    const sampleStudents = [
        {
            id: "s1",
            lrn: "123456789012",
            fullName: "Juan Cruz",
            gradeSection: "8-B",
            dateOfBirth: "2010-05-15",
            guardianName: "Maria Cruz",
            guardianPhone: "09171234567",
            medicalHistory: ["asthma"],
            dental: {
                lastCheckup: "2024-01-15",
                conditions: ["cavities"]
            },
            createdDate: new Date().toISOString(),
            isActive: true
        },
        {
            id: "s2",
            lrn: "123456789013",
            fullName: "Pedro Reyes",
            gradeSection: "7-C",
            dateOfBirth: "2011-08-22",
            guardianName: "Ana Reyes",
            guardianPhone: "09281234567",
            medicalHistory: [],
            dental: {
                lastCheckup: "2024-02-10",
                conditions: []
            },
            createdDate: new Date().toISOString(),
            isActive: true
        }
    ];

    const sampleVisits = [
        {
            id: "v1",
            studentLRN: "123456789012",
            studentName: "Juan Cruz",
            gradeSection: "8-B",
            complaint: "Fever and headache",
            treatment: "Paracetamol 500mg, rest in clinic",
            urgency: "routine",
            medicationDispensed: {
                medicationId: 1,
                medicationName: "Paracetamol",
                quantity: 2
            },
            dateTime: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
            status: "completed",
            nurseId: currentUser.name
        }
    ];

    if (studentRecords.length === 0) {
        studentRecords = sampleStudents;
        visitLogs = sampleVisits;
    }
}

// Initialize system when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    initializeTabs();
    showTab('dashboard');
    checkForAlerts();
});

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        min-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') alertDiv.style.backgroundColor = '#28a745';
    else if (type === 'error') alertDiv.style.backgroundColor = '#dc3545';
    else if (type === 'warning') alertDiv.style.backgroundColor = '#ffc107';
    else alertDiv.style.backgroundColor = '#17a2b8';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// System Alerts and Notifications
function checkForAlerts() {
    // Check for low stock medications
    const lowStockMeds = medications.filter(med => med.stock <= med.lowStockThreshold);
    lowStockMeds.forEach(med => {
        console.warn(`Low stock alert: ${med.name} (${med.stock} ${med.unit} remaining)`);
    });
    
    // Check for expiring medications
    const expiringMeds = medications.filter(med => isExpiringWithin30Days(med.expiry));
    expiringMeds.forEach(med => {
        console.warn(`Expiring soon: ${med.name} expires on ${formatDate(med.expiry)}`);
    });
}

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            showTab(targetTab);
        });
    });
}

function showTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(tabName);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
    
    // Load specific tab data
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'visit-logs':
            loadVisitLogs();
            break;
        case 'medications':
            loadMedicationInventory();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Functions
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
    const activityContainer = document.querySelector('.recent-activity');
    if (!activityContainer) return;
    
    // Clear existing activities
    const existingActivities = activityContainer.querySelectorAll('.activity-item');
    existingActivities.forEach(activity => activity.remove());
    
    // Add recent visit logs as activities
    const recentVisits = visitLogs.slice(-5).reverse();
    recentVisits.forEach(visit => {
        const student = studentRecords.find(s => s.lrn === visit.studentLRN);
        if (student) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="fas fa-user-injured activity-icon"></i>
                <div>
                    <p>${student.fullName} (${student.gradeSection}) - ${visit.complaint}</p>
                    <small>${getTimeAgo(visit.dateTime)}</small>
                </div>
            `;
            activityContainer.appendChild(activityItem);
        }
    });
    
    // If no recent activities, show default message
    if (recentVisits.length === 0) {
        const noActivityItem = document.createElement('div');
        noActivityItem.className = 'activity-item';
        noActivityItem.innerHTML = `
            <i class="fas fa-info-circle activity-icon"></i>
            <div>
                <p>No recent activities</p>
                <small>Visit logs will appear here</small>
            </div>
        `;
        activityContainer.appendChild(noActivityItem);
    }
}

function getTimeAgo(dateTime) {
    const now = new Date();
    const past = new Date(dateTime);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
}

// Student Search Functionality
function searchStudent() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase().trim();
    if (!searchTerm) {
        showAlert('Please enter a student ID or name to search', 'warning');
        return;
    }
    
    const foundStudent = studentRecords.find(student => 
        student.lrn.toLowerCase().includes(searchTerm) || 
        student.fullName.toLowerCase().includes(searchTerm)
    );
    
    if (foundStudent) {
        showStudentDetails(foundStudent);
    } else {
        showAlert('Student not found in records', 'error');
    }
}

function showStudentDetails(student) {
    const modal = createModal('Student Details', `
        <div class="student-details">
            <h4>${student.fullName}</h4>
            <p><strong>LRN:</strong> ${student.lrn}</p>
            <p><strong>Grade & Section:</strong> ${student.gradeSection}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(student.dateOfBirth)}</p>
            <p><strong>Guardian:</strong> ${student.guardianName}</p>
            <p><strong>Contact:</strong> ${student.guardianPhone}</p>
            
            <h5>Medical History:</h5>
            <p>${student.medicalHistory?.length ? student.medicalHistory.join(', ') : 'No known conditions'}</p>
            
            <h5>Recent Visits:</h5>
            <div class="recent-visits">
                ${getStudentRecentVisits(student.lrn)}
            </div>
        </div>
    `, [
        {text: 'New Visit', class: 'btn-primary', onclick: () => { closeAllModals(); showNewVisitModal(student.lrn); }},
        {text: 'Close', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function getStudentRecentVisits(lrn) {
    const studentVisits = visitLogs.filter(visit => visit.studentLRN === lrn)
                                    .slice(-3)
                                    .reverse();
    
    if (studentVisits.length === 0) {
        return '<p>No recent visits</p>';
    }
    
    return studentVisits.map(visit => `
        <div class="visit-summary">
            <p><strong>${formatDateTime(visit.dateTime)}</strong></p>
            <p>${visit.complaint}</p>
            <p><small>Treatment: ${visit.treatment}</small></p>
        </div>
    `).join('');
}

// Student Record Management
function saveStudentRecord() {
    const lrn = document.getElementById('studentLRN').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const gradeSection = document.getElementById('gradeSection').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const guardianName = document.getElementById('guardianName').value.trim();
    const guardianPhone = document.getElementById('guardianPhone').value.trim();
    
    // Validation
    if (!lrn || !fullName || !gradeSection || !dateOfBirth || !guardianName || !guardianPhone) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if student already exists
    const existingStudent = studentRecords.find(student => student.lrn === lrn);
    if (existingStudent) {
        showAlert('Student with this LRN already exists', 'error');
        return;
    }
    
    // Get medical history
    const medicalHistory = [];
    const checkedConditions = document.querySelectorAll('input[name="conditions"]:checked');
    checkedConditions.forEach(checkbox => {
        medicalHistory.push(checkbox.value);
    });
    
    // Get dental information
    const lastDentalCheckup = document.getElementById('lastDentalCheckup').value;
    const dentalConditionsSelect = document.getElementById('dentalConditions');
    const dentalConditions = Array.from(dentalConditionsSelect.selectedOptions)
                                  .map(option => option.value);
    
    // Create student record
    const studentRecord = {
        id: generateId(),
        lrn: lrn,
        fullName: fullName,
        gradeSection: gradeSection,
        dateOfBirth: dateOfBirth,
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        medicalHistory: medicalHistory,
        dental: {
            lastCheckup: lastDentalCheckup,
            conditions: dentalConditions
        },
        createdDate: new Date().toISOString(),
        isActive: true
    };
    
    studentRecords.push(studentRecord);
    showAlert('Student record saved successfully!', 'success');
    clearForm();
    updateDashboardStats();
}

function clearForm() {
    const fields = ['studentLRN', 'fullName', 'gradeSection', 'dateOfBirth', 'guardianName', 'guardianPhone', 'lastDentalCheckup'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) element.value = '';
    });
    
    // Clear checkboxes
    document.querySelectorAll('input[name="conditions"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear dental conditions
    const dentalSelect = document.getElementById('dentalConditions');
    if (dentalSelect) dentalSelect.selectedIndex = -1;
}

// Visit Log Management
function showNewVisitModal(studentLRN = '') {
    const modal = createModal('New Clinic Visit', `
        <div class="form-group">
            <label>Student LRN *</label>
            <input type="text" id="visitStudentLRN" value="${studentLRN}" placeholder="Enter Student LRN">
        </div>
        <div class="form-group">
            <label>Chief Complaint *</label>
            <textarea id="chiefComplaint" placeholder="Enter chief complaint" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>Treatment Given *</label>
            <textarea id="treatmentGiven" placeholder="Enter treatment given" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>Condition Urgency</label>
            <select id="urgencyLevel">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
            </select>
        </div>
        <div class="form-group">
            <label>Medication Dispensed (Optional)</label>
            <select id="medicationDispensed">
                <option value="">No medication</option>
                ${medications.map(med => `<option value="${med.id}">${med.name} (Stock: ${med.stock})</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="medicationQuantity" min="1" placeholder="Enter quantity">
        </div>
    `, [
        {text: 'Save Visit', class: 'btn-primary', onclick: saveVisitLog},
        {text: 'Cancel', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function saveVisitLog() {
    const studentLRN = document.getElementById('visitStudentLRN').value.trim();
    const complaint = document.getElementById('chiefComplaint').value.trim();
    const treatment = document.getElementById('treatmentGiven').value.trim();
    const urgency = document.getElementById('urgencyLevel').value;
    const medicationId = document.getElementById('medicationDispensed').value;
    const quantity = document.getElementById('medicationQuantity').value;
    
    // Validation
    if (!studentLRN || !complaint || !treatment) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if student exists
    const student = studentRecords.find(s => s.lrn === studentLRN);
    if (!student) {
        showAlert('Student not found. Please check the LRN or add the student first.', 'error');
        return;
    }
    
    // Handle medication dispensing
    let medicationDispensed = null;
    if (medicationId && quantity) {
        const medication = medications.find(m => m.id == medicationId);
        if (medication) {
            const qty = parseInt(quantity);
            if (medication.stock >= qty) {
                medication.stock -= qty;
                medicationDispensed = {
                    medicationId: medication.id,
                    medicationName: medication.name,
                    quantity: qty
                };
                
                // Log dispensing
                dispensingLogs.push({
                    id: generateId(),
                    medicationId: medication.id,
                    medicationName: medication.name,
                    studentLRN: studentLRN,
                    studentName: student.fullName,
                    quantity: qty,
                    reason: complaint,
                    dispensedBy: currentUser.name,
                    dateTime: new Date().toISOString()
                });
            } else {
                showAlert('Insufficient medication stock', 'error');
                return;
            }
        }
    }
    
    // Create visit log
    const visitLog = {
        id: generateId(),
        studentLRN: studentLRN,
        studentName: student.fullName,
        gradeSection: student.gradeSection,
        complaint: complaint,
        treatment: treatment,
        urgency: urgency,
        medicationDispensed: medicationDispensed,
        dateTime: new Date().toISOString(),
        status: urgency === 'emergency' ? 'urgent' : 'completed',
        nurseId: currentUser.name
    };
    
    visitLogs.push(visitLog);
    
    // Handle emergency protocol
    if (urgency === 'emergency') {
        handleEmergencyProtocol(student, visitLog);
    }
    
    showAlert('Visit log saved successfully!', 'success');
    closeAllModals();
    loadVisitLogs();
    updateDashboardStats();
    loadRecentActivity();
}

function handleEmergencyProtocol(student, visitLog) {
    // Send notification to parents/guardian
    sendEmergencyNotification(student, visitLog);
    
    // Log emergency in system
    console.log(`EMERGENCY: ${student.fullName} - ${visitLog.complaint}`);
    
    // Show emergency alert
    showAlert(`Emergency protocol activated for ${student.fullName}. Guardian notified.`, 'warning');
}

function sendEmergencyNotification(student, visitLog) {
    // Simulate sending notification (in real system, this would integrate with SMS/email service)
    const notification = {
        to: student.guardianPhone,
        message: `URGENT: Your child ${student.fullName} requires immediate medical attention at school. Please contact the clinic immediately.`,
        type: 'emergency',
        timestamp: new Date().toISOString()
    };
    
    console.log('Emergency notification sent:', notification);
}

function loadVisitLogs() {
    const tableBody = document.getElementById('visitLogTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (visitLogs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center;">No visit logs found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    visitLogs.slice().reverse().forEach(visit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(visit.dateTime)}</td>
            <td>${visit.studentName}</td>
            <td>${visit.gradeSection}</td>
            <td>${visit.complaint}</td>
            <td>${visit.treatment}</td>
            <td><span class="status-badge status-${visit.status}">${visit.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewVisitDetails('${visit.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editVisitLog('${visit.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewVisitDetails(visitId) {
    const visit = visitLogs.find(v => v.id === visitId);
    if (!visit) return;
    
    const modal = createModal('Visit Details', `
        <div class="visit-details">
            <h4>${visit.studentName} (${visit.gradeSection})</h4>
            <p><strong>Date & Time:</strong> ${formatDateTime(visit.dateTime)}</p>
            <p><strong>Chief Complaint:</strong> ${visit.complaint}</p>
            <p><strong>Treatment Given:</strong> ${visit.treatment}</p>
            <p><strong>Urgency Level:</strong> ${visit.urgency.toUpperCase()}</p>
            <p><strong>Status:</strong> ${visit.status.toUpperCase()}</p>
            ${visit.medicationDispensed ? `
                <p><strong>Medication:</strong> ${visit.medicationDispensed.medicationName} (${visit.medicationDispensed.quantity} ${visit.medicationDispensed.quantity > 1 ? 'units' : 'unit'})</p>
            ` : ''}
            <p><strong>Attended by:</strong> ${visit.nurseId}</p>
        </div>
    `, [
        {text: 'Close', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function editVisitLog(visitId) {
    const visit = visitLogs.find(v => v.id === visitId);
    if (!visit) return;
    
    const modal = createModal('Edit Visit Log', `
        <div class="form-group">
            <label>Student Name</label>
            <input type="text" value="${visit.studentName}" readonly>
        </div>
        <div class="form-group">
            <label>Chief Complaint</label>
            <textarea id="editComplaint" rows="3">${visit.complaint}</textarea>
        </div>
        <div class="form-group">
            <label>Treatment Given</label>
            <textarea id="editTreatment" rows="3">${visit.treatment}</textarea>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="editStatus">
                <option value="pending" ${visit.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="completed" ${visit.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="urgent" ${visit.status === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
        </div>
    `, [
        {text: 'Save Changes', class: 'btn-primary', onclick: () => updateVisitLog(visitId)},
        {text: 'Cancel', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function updateVisitLog(visitId) {
    const visit = visitLogs.find(v => v.id === visitId);
    if (!visit) return;
    
    const complaint = document.getElementById('editComplaint').value.trim();
    const treatment = document.getElementById('editTreatment').value.trim();
    const status = document.getElementById('editStatus').value;
    
    if (!complaint || !treatment) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    visit.complaint = complaint;
    visit.treatment = treatment;
    visit.status = status;
    
    showAlert('Visit log updated successfully!', 'success');
    closeAllModals();
    loadVisitLogs();
}

// Medication Management
function loadMedicationInventory() {
    const medicationGrid = document.querySelector('.medication-grid');
    if (!medicationGrid) return;
    
    medicationGrid.innerHTML = '';
    
    medications.forEach(medication => {
        const isLowStock = medication.stock <= medication.lowStockThreshold;
        const isExpiringSoon = isExpiringWithin30Days(medication.expiry);
        
        const medicationCard = document.createElement('div');
        medicationCard.className = 'medication-card';
        if (isLowStock) medicationCard.classList.add('low-stock');
        if (isExpiringSoon) medicationCard.classList.add('expiring-soon');
        
        medicationCard.innerHTML = `
            <h4>${medication.name}</h4>
            <p class="stock ${isLowStock ? 'low-stock' : ''}">
                Stock: ${medication.stock} ${medication.unit}
                ${isLowStock ? '<i class="fas fa-exclamation-triangle"></i>' : ''}
            </p>
            <p class="expiry ${isExpiringSoon ? 'expiring-soon' : ''}">
                Exp: ${formatDate(medication.expiry)}
                ${isExpiringSoon ? '<i class="fas fa-clock"></i>' : ''}
            </p>
            <div class="medication-actions">
                <button class="btn btn-sm btn-primary" onclick="dispenseMedication(${medication.id})">
                    <i class="fas fa-hand-holding-medical"></i> Dispense
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editMedication(${medication.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        `;
        medicationGrid.appendChild(medicationCard);
    });
}

function isExpiringWithin30Days(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
}

function dispenseMedication(medicationId) {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;
    
    const modal = createModal('Dispense Medication', `
        <div class="form-group">
            <label>Medication</label>
            <input type="text" value="${medication.name}" readonly>
        </div>
        <div class="form-group">
            <label>Current Stock</label>
            <input type="text" value="${medication.stock} ${medication.unit}" readonly>
        </div>
        <div class="form-group">
            <label>Student LRN *</label>
            <input type="text" id="dispenseStudentLRN" placeholder="Enter Student LRN">
        </div>
        <div class="form-group">
            <label>Quantity to Dispense *</label>
            <input type="number" id="dispenseQuantity" min="1" max="${medication.stock}" value="1">
        </div>
        <div class="form-group">
            <label>Reason *</label>
            <textarea id="dispenseReason" rows="2" placeholder="Enter reason for dispensing"></textarea>
        </div>
    `, [
        {text: 'Dispense', class: 'btn-primary', onclick: () => confirmDispenseMedication(medicationId)},
        {text: 'Cancel', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function confirmDispenseMedication(medicationId) {
    const studentLRN = document.getElementById('dispenseStudentLRN').value.trim();
    const quantity = parseInt(document.getElementById('dispenseQuantity').value);
    const reason = document.getElementById('dispenseReason').value.trim();
    
    if (!studentLRN || !quantity || !reason) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    const student = studentRecords.find(s => s.lrn === studentLRN);
    if (!student) {
        showAlert('Student not found. Please check the LRN.', 'error');
        return;
    }
    
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;
    
    if (medication.stock < quantity) {
        showAlert('Insufficient stock available', 'error');
        return;
    }
    
    // Update medication stock
    medication.stock -= quantity;
    
    // Log dispensing
    dispensingLogs.push({
        id: generateId(),
        medicationId: medication.id,
        medicationName: medication.name,
        studentLRN: studentLRN,
        studentName: student.fullName,
        quantity: quantity,
        reason: reason,
        dispensedBy: currentUser.name,
        dateTime: new Date().toISOString()
    });
    
    showAlert('Medication dispensed successfully!', 'success');
    closeAllModals();
    loadMedicationInventory();
    checkForAlerts();
}

function editMedication(medicationId) {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;
    
    const modal = createModal('Edit Medication', `
        <div class="form-group">
            <label>Name</label>
            <input type="text" id="editMedName" value="${medication.name}">
        </div>
        <div class="form-group">
            <label>Current Stock</label>
            <input type="number" id="editMedStock" value="${medication.stock}" min="0">
        </div>
        <div class="form-group">
            <label>Unit</label>
            <input type="text" id="editMedUnit" value="${medication.unit}">
        </div>
        <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" id="editMedExpiry" value="${medication.expiry}">
        </div>
        <div class="form-group">
            <label>Low Stock Threshold</label>
            <input type="number" id="editMedThreshold" value="${medication.lowStockThreshold}" min="0">
        </div>
    `, [
        {text: 'Save Changes', class: 'btn-primary', onclick: () => updateMedication(medicationId)},
        {text: 'Cancel', class: 'btn-secondary', onclick: closeAllModals}
    ]);
    
    showModal(modal);
}

function updateMedication(medicationId) {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;
    
    const name = document.getElementById('editMedName').value.trim();
    const stock = parseInt(document.getElementById('editMedStock').value);
    const unit = document.getElementById('editMedUnit').value.trim();
    const expiry = document.getElementById('editMedExpiry').value;
    const threshold = parseInt(document.getElementById('editMedThreshold').value);
    
    if (!name || isNaN(stock) || !unit || !expiry || isNaN(threshold)) {
        showAlert('Please fill in all fields correctly', 'error');
        return;
    }
    
    medication.name = name;
    medication.stock = stock;
    medication.unit = unit;
    medication.expiry = expiry;
    medication.lowStockThreshold = threshold;
    
    showAlert('Medication updated successfully!', 'success');
    closeAllModals();
    loadMedicationInventory();
    checkForAlerts();
}

// Modal Utility Functions
function createModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeAllModals()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${buttons.map(btn => `
                    <button class="btn ${btn.class}" onclick="${btn.onclick.toString()}">${btn.text}</button>
                `).join('')}
            </div>
        </div>
    `;
    return modal;
}

function showModal(modal) {
    closeAllModals(); // Close any existing modals
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
}