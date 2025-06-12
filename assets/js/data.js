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

// Data Management Functions
function saveStudentRecord(student) {
    const existingIndex = studentRecords.findIndex(s => s.lrn === student.lrn);
    if (existingIndex >= 0) {
        studentRecords[existingIndex] = { ...studentRecords[existingIndex], ...student };
        return studentRecords[existingIndex];
    } else {
        const newStudent = {
            id: generateId(),
            ...student,
            createdDate: new Date().toISOString(),
            isActive: true
        };
        studentRecords.push(newStudent);
        return newStudent;
    }
}

function getStudentByLRN(lrn) {
    return studentRecords.find(student => student.lrn === lrn);
}

function searchStudents(query) {
    query = query.toLowerCase();
    return studentRecords.filter(student => 
        student.lrn.includes(query) ||
        student.fullName.toLowerCase().includes(query) ||
        student.gradeSection.toLowerCase().includes(query)
    );
}

function saveVisitLog(visit) {
    const newVisit = {
        id: generateId(),
        ...visit,
        dateTime: new Date().toISOString(),
        nurseId: currentUser.name
    };
    visitLogs.push(newVisit);
    return newVisit;
}

function getVisitsByStudent(lrn) {
    return visitLogs.filter(visit => visit.studentLRN === lrn);
}

function updateMedicationStock(medicationId, quantity, isDispensing = true) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) return null;

    if (isDispensing) {
        if (medication.stock < quantity) return null;
        medication.stock -= quantity;
    } else {
        medication.stock += quantity;
    }

    return medication;
}

// Initialize data when the script loads
initializeSampleData(); 