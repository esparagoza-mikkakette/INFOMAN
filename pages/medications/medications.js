// Medications Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadMedicationInventory();
});

function loadMedicationInventory() {
    const container = document.querySelector('.medications-container');
    if (!container) return;

    container.innerHTML = medications.map(med => `
        <div class="medication-card">
            <div class="medication-header">
                <span class="medication-name">${med.name}</span>
                <span class="stock-badge ${getStockStatusClass(med)}">
                    ${med.stock} ${med.unit}
                </span>
            </div>

            <div class="medication-details">
                <div class="detail-item">
                    <span class="detail-label">Stock Level</span>
                    <span>${med.stock} / ${med.lowStockThreshold * 2} ${med.unit}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Low Stock Alert</span>
                    <span>${med.lowStockThreshold} ${med.unit}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Expiry Date</span>
                    <span>${formatDate(med.expiry)}</span>
                </div>
            </div>

            <div class="stock-chart">
                <div class="stock-bar">
                    <div class="stock-level" style="width: ${(med.stock / (med.lowStockThreshold * 2)) * 100}%"></div>
                </div>
            </div>

            ${isExpiringWithin30Days(med.expiry) ? `
                <div class="expiry-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Expiring soon
                </div>
            ` : ''}

            <div class="medication-actions">
                <button class="btn btn-primary" onclick="showDispenseModal(${med.id})">
                    <i class="fas fa-prescription-bottle-alt"></i> Dispense
                </button>
                <button class="btn btn-secondary" onclick="showRestockModal(${med.id})">
                    <i class="fas fa-plus"></i> Restock
                </button>
                <button class="btn btn-secondary" onclick="editMedication(${med.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `).join('');
}

function getStockStatusClass(medication) {
    if (medication.stock <= medication.lowStockThreshold / 2) return 'stock-low';
    if (medication.stock <= medication.lowStockThreshold) return 'stock-warning';
    return 'stock-normal';
}

function showDispenseModal(medicationId) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) {
        showAlert('Medication not found', 'error');
        return;
    }

    const content = `
        <form id="dispenseForm" onsubmit="confirmDispenseMedication(${medicationId}); return false;">
            <div class="inventory-form">
                <div class="form-group">
                    <label>Quantity to Dispense (${medication.unit})</label>
                    <input type="number" id="dispenseQuantity" required min="1" max="${medication.stock}">
                    <small>Available: ${medication.stock} ${medication.unit}</small>
                </div>
                <div class="form-group">
                    <label>Student LRN</label>
                    <input type="text" id="studentLRN" required>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="dispenseNotes"></textarea>
                </div>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Dispense',
            class: 'btn-primary',
            onClick: 'document.getElementById("dispenseForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Dispense Medication', content, buttons);
    showModal(modal);
}

function confirmDispenseMedication(medicationId) {
    const quantity = parseInt(document.getElementById('dispenseQuantity').value);
    const studentLRN = document.getElementById('studentLRN').value;
    const notes = document.getElementById('dispenseNotes').value;

    const medication = medications.find(med => med.id === medicationId);
    if (!medication) {
        showAlert('Medication not found', 'error');
        return;
    }

    if (quantity > medication.stock) {
        showAlert('Not enough stock available', 'error');
        return;
    }

    const student = getStudentByLRN(studentLRN);
    if (!student) {
        showAlert('Student not found', 'error');
        return;
    }

    // Update medication stock
    const updatedMedication = updateMedicationStock(medicationId, quantity, true);
    if (!updatedMedication) {
        showAlert('Error updating medication stock', 'error');
        return;
    }

    // Create dispensing log
    const dispensingLog = {
        id: generateId(),
        medicationId: medicationId,
        medicationName: medication.name,
        quantity: quantity,
        studentLRN: studentLRN,
        studentName: student.fullName,
        dateTime: new Date().toISOString(),
        notes: notes,
        nurseId: currentUser.name
    };

    dispensingLogs.push(dispensingLog);

    showAlert('Medication dispensed successfully', 'success');
    closeAllModals();
    loadMedicationInventory();
}

function showRestockModal(medicationId) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) {
        showAlert('Medication not found', 'error');
        return;
    }

    const content = `
        <form id="restockForm" onsubmit="confirmRestock(${medicationId}); return false;">
            <div class="inventory-form">
                <div class="form-group">
                    <label>Quantity to Add (${medication.unit})</label>
                    <input type="number" id="restockQuantity" required min="1">
                </div>
                <div class="form-group">
                    <label>New Expiry Date</label>
                    <input type="date" id="newExpiryDate" required>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="restockNotes"></textarea>
                </div>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Restock',
            class: 'btn-primary',
            onClick: 'document.getElementById("restockForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Restock Medication', content, buttons);
    showModal(modal);
}

function confirmRestock(medicationId) {
    const quantity = parseInt(document.getElementById('restockQuantity').value);
    const newExpiryDate = document.getElementById('newExpiryDate').value;
    const notes = document.getElementById('restockNotes').value;

    // Update medication stock
    const updatedMedication = updateMedicationStock(medicationId, quantity, false);
    if (!updatedMedication) {
        showAlert('Error updating medication stock', 'error');
        return;
    }

    // Update expiry date if it's earlier than the current one
    const medicationIndex = medications.findIndex(med => med.id === medicationId);
    if (new Date(newExpiryDate) < new Date(medications[medicationIndex].expiry)) {
        medications[medicationIndex].expiry = newExpiryDate;
    }

    showAlert('Medication restocked successfully', 'success');
    closeAllModals();
    loadMedicationInventory();
}

function editMedication(medicationId) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) {
        showAlert('Medication not found', 'error');
        return;
    }

    const content = `
        <form id="editMedicationForm" onsubmit="updateMedication(${medicationId}); return false;">
            <div class="inventory-form">
                <div class="form-group">
                    <label>Medication Name</label>
                    <input type="text" id="editName" value="${medication.name}" required>
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" id="editUnit" value="${medication.unit}" required>
                </div>
                <div class="form-group">
                    <label>Low Stock Threshold</label>
                    <input type="number" id="editThreshold" value="${medication.lowStockThreshold}" required min="1">
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" id="editExpiry" value="${medication.expiry}" required>
                </div>
            </div>
        </form>
    `;

    const buttons = [
        {
            text: 'Save Changes',
            class: 'btn-primary',
            onClick: 'document.getElementById("editMedicationForm").requestSubmit()'
        },
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onClick: 'closeAllModals()'
        }
    ];

    const modal = createModal('Edit Medication', content, buttons);
    showModal(modal);
}

function updateMedication(medicationId) {
    const medicationIndex = medications.findIndex(med => med.id === medicationId);
    if (medicationIndex === -1) {
        showAlert('Medication not found', 'error');
        return;
    }

    const updatedMedication = {
        ...medications[medicationIndex],
        name: document.getElementById('editName').value,
        unit: document.getElementById('editUnit').value,
        lowStockThreshold: parseInt(document.getElementById('editThreshold').value),
        expiry: document.getElementById('editExpiry').value
    };

    medications[medicationIndex] = updatedMedication;
    showAlert('Medication updated successfully', 'success');
    closeAllModals();
    loadMedicationInventory();
} 