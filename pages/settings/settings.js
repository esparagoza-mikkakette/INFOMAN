// Settings Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});

function loadSettings() {
    const container = document.querySelector('.settings-container');
    if (!container) return;

    container.innerHTML = `
        <!-- Profile Settings -->
        <div class="settings-card">
            <div class="settings-header">
                <i class="fas fa-user-circle"></i>
                <h3 class="settings-title">Profile Settings</h3>
            </div>

            <div class="user-avatar">
                <i class="fas fa-user-nurse"></i>
            </div>

            <form id="profileForm" class="settings-form" onsubmit="updateProfile(event)">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="fullName" value="Nurse Rivera" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" value="nurse.rivera@pdmhs.edu.ph" required>
                </div>
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" id="phone" value="+63 912 345 6789" required>
                </div>
                <div class="settings-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </form>
        </div>

        <!-- Security Settings -->
        <div class="settings-card">
            <div class="settings-header">
                <i class="fas fa-shield-alt"></i>
                <h3 class="settings-title">Security Settings</h3>
            </div>

            <form id="securityForm" class="settings-form" onsubmit="updateSecurity(event)">
                <div class="form-group">
                    <label>Current Password</label>
                    <input type="password" id="currentPassword" required>
                </div>
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <div class="settings-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-key"></i> Change Password
                    </button>
                </div>
            </form>
        </div>

        <!-- Notification Settings -->
        <div class="settings-card">
            <div class="settings-header">
                <i class="fas fa-bell"></i>
                <h3 class="settings-title">Notification Settings</h3>
            </div>

            <ul class="settings-list">
                <li class="settings-item">
                    <span class="settings-item-label">
                        <i class="fas fa-pills"></i>
                        Low Stock Alerts
                    </span>
                    <label class="toggle-switch">
                        <input type="checkbox" checked onchange="updateNotificationSetting('lowStock', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </li>
                <li class="settings-item">
                    <span class="settings-item-label">
                        <i class="fas fa-calendar-alt"></i>
                        Expiry Reminders
                    </span>
                    <label class="toggle-switch">
                        <input type="checkbox" checked onchange="updateNotificationSetting('expiry', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </li>
                <li class="settings-item">
                    <span class="settings-item-label">
                        <i class="fas fa-file-medical"></i>
                        Daily Reports
                    </span>
                    <label class="toggle-switch">
                        <input type="checkbox" onchange="updateNotificationSetting('dailyReports', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </li>
            </ul>
        </div>

        <!-- Data Management -->
        <div class="settings-card">
            <div class="settings-header">
                <i class="fas fa-database"></i>
                <h3 class="settings-title">Data Management</h3>
            </div>

            <div class="backup-info">
                <div class="backup-status">
                    <i class="fas fa-check-circle"></i>
                    <span>Last backup: ${formatDateTime(new Date())}</span>
                </div>
                <button class="btn btn-secondary" onclick="backupData()">
                    <i class="fas fa-cloud-upload-alt"></i> Backup Now
                </button>
            </div>

            <div class="settings-actions">
                <button class="btn btn-secondary" onclick="exportData()">
                    <i class="fas fa-file-export"></i> Export Data
                </button>
                <button class="btn btn-accent" onclick="showImportModal()">
                    <i class="fas fa-file-import"></i> Import Data
                </button>
            </div>
        </div>
    `;
}

function updateProfile(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Update user profile in the system
    currentUser = {
        ...currentUser,
        name: fullName,
        email: email,
        phone: phone
    };

    showAlert('Profile updated successfully', 'success');
}

function updateSecurity(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate current password
    if (currentPassword !== 'demo123') {
        showAlert('Current password is incorrect', 'error');
        return;
    }

    // Validate new password
    if (newPassword.length < 8) {
        showAlert('New password must be at least 8 characters long', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }

    // Update password in the system
    showAlert('Password changed successfully', 'success');
    document.getElementById('securityForm').reset();
}

function updateNotificationSetting(setting, enabled) {
    // Update notification settings in the system
    notificationSettings = {
        ...notificationSettings,
        [setting]: enabled
    };

    showAlert('Notification settings updated', 'success');
}

function backupData() {
    // Simulate backup process
    showAlert('Backing up data...', 'info');
    setTimeout(() => {
        showAlert('Data backup completed successfully', 'success');
        const backupStatus = document.querySelector('.backup-status span');
        if (backupStatus) {
            backupStatus.textContent = `Last backup: ${formatDateTime(new Date())}`;
        }
    }, 2000);
}

function exportData() {
    // Prepare data for export
    const exportData = {
        students,
        visitLogs,
        medications,
        dispensingLogs
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdmhs_medical_data_${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert('Data exported successfully', 'success');
}

function showImportModal() {
    const content = `
        <form id="importForm" onsubmit="importData(event)">
            <div class="form-group">
                <label>Select JSON File</label>
                <input type="file" id="importFile" accept=".json" required>
            </div>
            <div class="form-group">
                <label>Import Options</label>
                <div>
                    <label>
                        <input type="checkbox" id="mergeData" checked>
                        Merge with existing data
                    </label>
                </div>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Import',
            class: 'btn-primary',
            onClick: 'document.getElementById("importForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Import Data', content, buttons);
    showModal(modal);
}

function importData(event) {
    event.preventDefault();
    const fileInput = document.getElementById('importFile');
    const mergeData = document.getElementById('mergeData').checked;

    if (!fileInput.files.length) {
        showAlert('Please select a file to import', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validate imported data structure
            if (!validateImportedData(importedData)) {
                showAlert('Invalid data format', 'error');
                return;
            }

            // Import data
            if (mergeData) {
                // Merge with existing data
                students.push(...importedData.students);
                visitLogs.push(...importedData.visitLogs);
                medications.push(...importedData.medications);
                dispensingLogs.push(...importedData.dispensingLogs);
            } else {
                // Replace existing data
                students = importedData.students;
                visitLogs = importedData.visitLogs;
                medications = importedData.medications;
                dispensingLogs = importedData.dispensingLogs;
            }

            showAlert('Data imported successfully', 'success');
            closeAllModals();

        } catch (error) {
            showAlert('Error importing data: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

function validateImportedData(data) {
    return data &&
           Array.isArray(data.students) &&
           Array.isArray(data.visitLogs) &&
           Array.isArray(data.medications) &&
           Array.isArray(data.dispensingLogs);
} 