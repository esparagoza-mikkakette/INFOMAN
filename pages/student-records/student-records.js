// Student Records Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a student LRN in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lrn = urlParams.get('lrn');
    
    if (lrn) {
        loadStudentData(lrn);
    }
});

function loadStudentData(lrn) {
    const student = getStudentByLRN(lrn);
    if (!student) {
        showAlert('Student not found', 'error');
        return;
    }

    // Fill in the form with student data
    document.getElementById('studentLRN').value = student.lrn;
    document.getElementById('fullName').value = student.fullName;
    document.getElementById('gradeSection').value = student.gradeSection;
    document.getElementById('dateOfBirth').value = student.dateOfBirth;
    document.getElementById('guardianName').value = student.guardianName;
    document.getElementById('guardianPhone').value = student.guardianPhone;

    // Set medical conditions
    document.querySelectorAll('input[name="conditions"]').forEach(checkbox => {
        checkbox.checked = student.medicalHistory.includes(checkbox.value);
    });

    // Set dental records
    if (student.dental) {
        document.getElementById('lastDentalCheckup').value = student.dental.lastCheckup;
        const dentalSelect = document.getElementById('dentalConditions');
        Array.from(dentalSelect.options).forEach(option => {
            option.selected = student.dental.conditions.includes(option.value);
        });
    }
}

function saveStudentRecord() {
    // Get form values
    const studentData = {
        lrn: document.getElementById('studentLRN').value,
        fullName: document.getElementById('fullName').value,
        gradeSection: document.getElementById('gradeSection').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        guardianName: document.getElementById('guardianName').value,
        guardianPhone: document.getElementById('guardianPhone').value,
        medicalHistory: Array.from(document.querySelectorAll('input[name="conditions"]:checked'))
            .map(cb => cb.value),
        dental: {
            lastCheckup: document.getElementById('lastDentalCheckup').value,
            conditions: Array.from(document.getElementById('dentalConditions').selectedOptions)
                .map(option => option.value)
        }
    };

    // Validate required fields
    if (!studentData.lrn || !studentData.fullName || !studentData.gradeSection) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }

    // Save the record
    try {
        const savedStudent = saveStudentRecord(studentData);
        showAlert('Student record saved successfully', 'success');
        
        // If this was a new record, clear the form
        if (!studentData.id) {
            clearForm();
        }
    } catch (error) {
        showAlert('Error saving student record', 'error');
        console.error('Error saving student record:', error);
    }
}

function clearForm() {
    // Clear all input fields
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], select')
        .forEach(input => input.value = '');

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]')
        .forEach(checkbox => checkbox.checked = false);

    // Clear multiple select
    document.getElementById('dentalConditions').selectedIndex = -1;
}

function showAddStudentModal() {
    clearForm();
    document.getElementById('studentLRN').focus();
} 