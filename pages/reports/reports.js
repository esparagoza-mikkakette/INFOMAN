// Reports Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadReportCards();
});

function loadReportCards() {
    const container = document.querySelector('.reports-container');
    if (!container) return;

    const reports = [
        {
            id: 'clinic-visits',
            title: 'Clinic Visit Report',
            icon: 'fas fa-clipboard-list',
            description: 'Summary of clinic visits, common complaints, and treatment statistics'
        },
        {
            id: 'medication-inventory',
            title: 'Medication Inventory Report',
            icon: 'fas fa-pills',
            description: 'Overview of medication stock levels, usage, and expiry tracking'
        },
        {
            id: 'student-health',
            title: 'Student Health Report',
            icon: 'fas fa-user-injured',
            description: 'Analysis of student health records and medical conditions'
        }
    ];

    container.innerHTML = reports.map(report => `
        <div class="report-card">
            <div class="report-header">
                <h3 class="report-title">
                    <i class="${report.icon}"></i>
                    ${report.title}
                </h3>
            </div>

            <p>${report.description}</p>

            <div class="report-filters">
                <div class="form-group">
                    <label>Date Range</label>
                    <select id="${report.id}-range" onchange="updateReportPreview('${report.id}')">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn btn-primary" onclick="generateReport('${report.id}')">
                    <i class="fas fa-download"></i> Generate Report
                </button>
                <button class="btn btn-secondary" onclick="previewReport('${report.id}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
            </div>

            <div id="${report.id}-preview" class="report-preview" style="display: none;">
                <!-- Report preview content will be loaded here -->
            </div>
        </div>
    `).join('');
}

function updateReportPreview(reportId) {
    const range = document.getElementById(`${reportId}-range`).value;
    if (range === 'custom') {
        showCustomDateRangeModal(reportId);
    } else {
        loadReportData(reportId, range);
    }
}

function showCustomDateRangeModal(reportId) {
    const content = `
        <form id="dateRangeForm" onsubmit="applyCustomDateRange('${reportId}'); return false;">
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" id="startDate" required>
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" id="endDate" required>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Apply',
            class: 'btn-primary',
            onClick: 'document.getElementById("dateRangeForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Select Date Range', content, buttons);
    showModal(modal);
}

function applyCustomDateRange(reportId) {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        showAlert('Please select both start and end dates', 'error');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showAlert('Start date cannot be after end date', 'error');
        return;
    }

    loadReportData(reportId, 'custom', { startDate, endDate });
    closeAllModals();
}

function loadReportData(reportId, range, customDates = null) {
    const previewContainer = document.getElementById(`${reportId}-preview`);
    if (!previewContainer) return;

    let data;
    switch (reportId) {
        case 'clinic-visits':
            data = generateClinicVisitsReport(range, customDates);
            break;
        case 'medication-inventory':
            data = generateMedicationReport(range, customDates);
            break;
        case 'student-health':
            data = generateStudentHealthReport(range, customDates);
            break;
    }

    if (!data) {
        previewContainer.innerHTML = '<p>No data available for the selected period</p>';
        return;
    }

    previewContainer.style.display = 'block';
    previewContainer.innerHTML = `
        <div class="report-summary">
            ${data.summary.map(item => `
                <div class="summary-card">
                    <div class="summary-value">${item.value}</div>
                    <div class="summary-label">${item.label}</div>
                </div>
            `).join('')}
        </div>

        <div class="chart-container">
            <!-- Chart will be rendered here -->
        </div>

        <table class="report-table">
            <thead>
                <tr>
                    ${data.headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.rows.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="report-note">
            <i class="fas fa-info-circle"></i>
            ${data.note}
        </div>
    `;

    // Initialize chart if needed
    if (data.chartData) {
        initializeChart(`${reportId}-preview .chart-container`, data.chartData);
    }
}

function generateClinicVisitsReport(range, customDates) {
    // Filter visit logs based on date range
    const visits = filterDataByDateRange(visitLogs, range, customDates);
    if (!visits.length) return null;

    // Calculate summary statistics
    const totalVisits = visits.length;
    const uniqueStudents = new Set(visits.map(v => v.studentLRN)).size;
    const commonComplaints = getTopComplaints(visits);

    return {
        summary: [
            { value: totalVisits, label: 'Total Visits' },
            { value: uniqueStudents, label: 'Unique Students' },
            { value: commonComplaints[0]?.count || 0, label: 'Most Common Complaint' }
        ],
        headers: ['Date', 'Student Name', 'Grade & Section', 'Complaint', 'Treatment', 'Status'],
        rows: visits.map(visit => [
            formatDate(visit.dateTime),
            visit.studentName,
            visit.gradeSection,
            visit.complaint,
            visit.treatment,
            visit.status
        ]),
        note: `Report generated for ${formatDateRange(range, customDates)}. Most common complaint: ${commonComplaints[0]?.complaint || 'N/A'}.`,
        chartData: {
            type: 'line',
            data: aggregateVisitsByDate(visits)
        }
    };
}

function generateMedicationReport(range, customDates) {
    // Get medication dispensing logs for the period
    const logs = filterDataByDateRange(dispensingLogs, range, customDates);
    if (!logs.length) return null;

    // Calculate medication usage statistics
    const medicationUsage = calculateMedicationUsage(logs);
    const lowStockItems = medications.filter(med => med.stock <= med.lowStockThreshold);

    return {
        summary: [
            { value: logs.length, label: 'Total Dispensed' },
            { value: medicationUsage.size, label: 'Different Medications' },
            { value: lowStockItems.length, label: 'Low Stock Items' }
        ],
        headers: ['Medication', 'Current Stock', 'Dispensed', 'Remaining %', 'Status'],
        rows: Array.from(medicationUsage).map(([medId, usage]) => {
            const med = medications.find(m => m.id === medId);
            if (!med) return null;
            const remainingPercent = (med.stock / (med.lowStockThreshold * 2) * 100).toFixed(1);
            return [
                med.name,
                `${med.stock} ${med.unit}`,
                `${usage} ${med.unit}`,
                `${remainingPercent}%`,
                getStockStatus(med)
            ];
        }).filter(Boolean),
        note: `Report generated for ${formatDateRange(range, customDates)}. ${lowStockItems.length} medications are running low on stock.`,
        chartData: {
            type: 'bar',
            data: Array.from(medicationUsage).map(([medId, usage]) => ({
                label: medications.find(m => m.id === medId)?.name || '',
                value: usage
            }))
        }
    };
}

function generateStudentHealthReport(range, customDates) {
    // Get relevant visit logs
    const visits = filterDataByDateRange(visitLogs, range, customDates);
    if (!visits.length) return null;

    // Analyze student health patterns
    const healthConditions = analyzeHealthConditions(visits);
    const gradeDistribution = analyzeGradeDistribution(visits);

    return {
        summary: [
            { value: healthConditions.size, label: 'Health Conditions' },
            { value: gradeDistribution.size, label: 'Grade Levels' },
            { value: calculateAverageVisitsPerStudent(visits), label: 'Avg Visits/Student' }
        ],
        headers: ['Health Condition', 'Occurrences', 'Affected Students', '% of Total'],
        rows: Array.from(healthConditions).map(([condition, stats]) => [
            condition,
            stats.count,
            stats.students.size,
            ((stats.students.size / students.length) * 100).toFixed(1) + '%'
        ]),
        note: `Report generated for ${formatDateRange(range, customDates)}. Analysis based on ${visits.length} clinic visits.`,
        chartData: {
            type: 'pie',
            data: Array.from(healthConditions).map(([condition, stats]) => ({
                label: condition,
                value: stats.count
            }))
        }
    };
}

// Utility Functions
function filterDataByDateRange(data, range, customDates) {
    const endDate = new Date();
    let startDate;

    if (customDates) {
        startDate = new Date(customDates.startDate);
        endDate.setHours(23, 59, 59, 999);
    } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(range));
    }

    return data.filter(item => {
        const itemDate = new Date(item.dateTime);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

function formatDateRange(range, customDates) {
    if (customDates) {
        return `${formatDate(customDates.startDate)} to ${formatDate(customDates.endDate)}`;
    }
    return `last ${range} days`;
}

function getTopComplaints(visits) {
    const complaints = {};
    visits.forEach(visit => {
        complaints[visit.complaint] = (complaints[visit.complaint] || 0) + 1;
    });

    return Object.entries(complaints)
        .map(([complaint, count]) => ({ complaint, count }))
        .sort((a, b) => b.count - a.count);
}

function calculateMedicationUsage(logs) {
    const usage = new Map();
    logs.forEach(log => {
        const current = usage.get(log.medicationId) || 0;
        usage.set(log.medicationId, current + log.quantity);
    });
    return usage;
}

function analyzeHealthConditions(visits) {
    const conditions = new Map();
    visits.forEach(visit => {
        const condition = visit.complaint;
        const current = conditions.get(condition) || { count: 0, students: new Set() };
        current.count++;
        current.students.add(visit.studentLRN);
        conditions.set(condition, current);
    });
    return conditions;
}

function analyzeGradeDistribution(visits) {
    const distribution = new Map();
    visits.forEach(visit => {
        const grade = visit.gradeSection.split('-')[0];
        const current = distribution.get(grade) || 0;
        distribution.set(grade, current + 1);
    });
    return distribution;
}

function calculateAverageVisitsPerStudent(visits) {
    const uniqueStudents = new Set(visits.map(v => v.studentLRN)).size;
    return (visits.length / uniqueStudents).toFixed(1);
}

function aggregateVisitsByDate(visits) {
    const aggregated = new Map();
    visits.forEach(visit => {
        const date = formatDate(visit.dateTime);
        const current = aggregated.get(date) || 0;
        aggregated.set(date, current + 1);
    });
    return Array.from(aggregated).map(([date, count]) => ({
        label: date,
        value: count
    }));
}

function getStockStatus(medication) {
    if (medication.stock <= medication.lowStockThreshold / 2) return 'Critical';
    if (medication.stock <= medication.lowStockThreshold) return 'Low';
    return 'Normal';
}

function generateReport(reportId) {
    const range = document.getElementById(`${reportId}-range`).value;
    let data;

    if (range === 'custom') {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        if (!startDate || !endDate) {
            showAlert('Please select a date range first', 'error');
            return;
        }
        data = loadReportData(reportId, range, { startDate, endDate });
    } else {
        data = loadReportData(reportId, range);
    }

    if (!data) {
        showAlert('No data available for the selected period', 'error');
        return;
    }

    // In a real application, this would generate a PDF or Excel file
    showAlert('Report generated successfully. Download starting...', 'success');
}

function previewReport(reportId) {
    const previewContainer = document.getElementById(`${reportId}-preview`);
    if (!previewContainer) return;

    const isVisible = previewContainer.style.display !== 'none';
    previewContainer.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        updateReportPreview(reportId);
    }
} 