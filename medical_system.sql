-- PDMHS Medical System Database Schema

-- Students Table
CREATE TABLE students (
    lrn VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    grade_section VARCHAR(10),
    date_of_birth DATE,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20)
);

-- Medical Conditions Table
CREATE TABLE student_medical_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_lrn VARCHAR(20),
    condition_name VARCHAR(50),
    FOREIGN KEY (student_lrn) REFERENCES students(lrn)
);

-- Dental Records Table
CREATE TABLE dental_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_lrn VARCHAR(20),
    last_dental_checkup DATE,
    dental_conditions TEXT,
    FOREIGN KEY (student_lrn) REFERENCES students(lrn)
);

-- Visit Logs Table
CREATE TABLE visit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_lrn VARCHAR(20),
    visit_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    treatment_given TEXT,
    urgency_level ENUM('routine', 'urgent', 'emergency'),
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (student_lrn) REFERENCES students(lrn)
);

-- Medications Inventory Table
CREATE TABLE medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_name VARCHAR(100) NOT NULL,
    current_stock INT,
    expiry_date DATE,
    stock_status ENUM('normal', 'low') DEFAULT 'normal'
);

-- Medication Dispensing Log
CREATE TABLE medication_dispensing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT,
    student_lrn VARCHAR(20),
    dispensed_quantity INT,
    dispensed_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id),
    FOREIGN KEY (student_lrn) REFERENCES students(lrn)
);

-- Sample Insertion Queries
INSERT INTO students (lrn, full_name, grade_section, date_of_birth, guardian_name, guardian_phone)
VALUES 
('2023001', 'Juan Cruz', '8-B', '2008-05-15', 'Maria Cruz', '09123456789'),
('2023002', 'Pedro Reyes', '7-C', '2009-03-22', 'Carlos Reyes', '09987654321');

INSERT INTO student_medical_conditions (student_lrn, condition_name)
VALUES 
('2023001', 'Asthma'),
('2023002', 'Peanut Allergy');

INSERT INTO medications (medication_name, current_stock, expiry_date, stock_status)
VALUES 
('Paracetamol', 150, '2025-12-31', 'normal'),
('Ibuprofen', 25, '2026-01-31', 'low'),
('Antiseptic Solution', 8, '2026-03-15', 'normal');