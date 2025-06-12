// Visit Logs Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadVisitLogs();
});

function loadVisitLogs() {
    const visitTable = document.getElementById('visitLogsTable');
    if (!visitTable) return;

    // Sort visits by date, most recent first
    const sortedVisits = [...visitLogs].sort((a, b) => 
        new Date(b.dateTime) - new Date(a.dateTime)
    );

    visitTable.innerHTML = `
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>Student Name</th>
                <th>Grade & Section</th>
                <th>Complaint</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${sortedVisits.map(visit => `
                <tr>
                    <td>${formatDateTime(visit.dateTime)}</td>
                    <td>${visit.studentName}</td>
                    <td>${visit.gradeSection}</td>
                    <td>${visit.complaint}</td>
                    <td>
                        <span class="status-badge status-${visit.status.toLowerCase()}">
                            ${visit.status}
                        </span>
                    </td>
                    <td class="visit-actions">
                        <button class="btn btn-secondary" onclick="viewVisitDetails('${visit.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-primary" onclick="editVisitLog('${visit.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

function viewVisitDetails(visitId) {
    const visit = visitLogs.find(v => v.id === visitId);
    if (!visit) {
        showAlert('Visit record not found', 'error');
        return;
    }

    const student = getStudentByLRN(visit.studentLRN);
    const content = `
        <div class="visit-details">
            <div class="visit-info">
                <h3><i class="fas fa-user-injured"></i> Student Information</h3>
                <div class="info-grid">
                    <span class="info-label">Name:</span>
                    <span>${visit.studentName}</span>
                    <span class="info-label">Grade & Section:</span>
                    <span>${visit.gradeSection}</span>
                    <span class="info-label">LRN:</span>
                    <span>${visit.studentLRN}</span>
                    ${student ? `
                        <span class="info-label">Medical History:</span>
                        <span>${student.medicalHistory.length ? student.medicalHistory.join(', ') : 'None'}</span>
                    ` : ''}
                </div>
            </div>

            <div class="treatment-info">
                <h3><i class="fas fa-notes-medical"></i> Treatment Details</h3>
                <div class="info-grid">
                    <span class="info-label">Date & Time:</span>
                    <span>${formatDateTime(visit.dateTime)}</span>
                    <span class="info-label">Complaint:</span>
                    <span>${visit.complaint}</span>
                    <span class="info-label">Treatment:</span>
                    <span>${visit.treatment}</span>
                    <span class="info-label">Status:</span>
                    <span>
                        <span class="status-badge status-${visit.status.toLowerCase()}">
                            ${visit.status}
                        </span>
                    </span>
                    <span class="info-label">Nurse:</span>
                    <span>${visit.nurseId}</span>
                </div>

                ${visit.medicationDispensed ? `
                    <div class="medication-dispensed">
                        <h4><i class="fas fa-pills"></i> Medication Dispensed</h4>
                        <div class="info-grid">
                            <span class="info-label">Medication:</span>
                            <span>${visit.medicationDispensed.medicationName}</span>
                            <span class="info-label">Quantity:</span>
                            <span>${visit.medicationDispensed.quantity} units</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    const modal = createModal('Visit Details', content);
    showModal(modal);
}

function editVisitLog(visitId) {
    const visit = visitLogs.find(v => v.id === visitId);
    if (!visit) {
        showAlert('Visit record not found', 'error');
        return;
    }

    const content = `
        <form id="editVisitForm" onsubmit="updateVisitLog('${visitId}'); return false;">
            <div class="form-group">
                <label>Complaint</label>
                <textarea id="editComplaint" required>${visit.complaint}</textarea>
            </div>
            <div class="form-group">
                <label>Treatment</label>
                <textarea id="editTreatment" required>${visit.treatment}</textarea>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editStatus" required>
                    <option value="pending" ${visit.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${visit.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="urgent" ${visit.status === 'urgent' ? 'selected' : ''}>Urgent</option>
                </select>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Save Changes',
            class: 'btn-primary',
            onClick: 'document.getElementById("editVisitForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Edit Visit Log', content, buttons);
    showModal(modal);
}

function updateVisitLog(visitId) {
    const visitIndex = visitLogs.findIndex(v => v.id === visitId);
    if (visitIndex === -1) {
        showAlert('Visit record not found', 'error');
        return;
    }

    const updatedVisit = {
        ...visitLogs[visitIndex],
        complaint: document.getElementById('editComplaint').value,
        treatment: document.getElementById('editTreatment').value,
        status: document.getElementById('editStatus').value
    };

    visitLogs[visitIndex] = updatedVisit;
    showAlert('Visit log updated successfully', 'success');
    closeAllModals();
    loadVisitLogs();
}

function filterVisits() {
    const searchInput = document.getElementById('visitSearch');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (!searchInput || !statusFilter || !dateFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const date = dateFilter.value;

    const filteredVisits = visitLogs.filter(visit => {
        const matchesSearch = visit.studentName.toLowerCase().includes(searchTerm) ||
                            visit.studentLRN.includes(searchTerm) ||
                            visit.complaint.toLowerCase().includes(searchTerm);
        
        const matchesStatus = status === '' || visit.status === status;
        
        const matchesDate = !date || new Date(visit.dateTime).toLocaleDateString() === new Date(date).toLocaleDateString();

        return matchesSearch && matchesStatus && matchesDate;
    });

    const visitTable = document.getElementById('visitLogsTable');
    if (visitTable) {
        visitTable.innerHTML = generateVisitTableHTML(filteredVisits);
    }
} 