<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../../config/db_conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

$userType = $input['userType'] ?? '';
$lrn = $input['lrn'] ?? '';
$fullName = $input['fullName'] ?? '';
$birthMonth = $input['birthMonth'] ?? '';
$birthDay = $input['birthDay'] ?? '';
$birthYear = $input['birthYear'] ?? '';
$password = $input['password'] ?? '';
$confirmPassword = $input['confirmPassword'] ?? '';

// Validate required fields
if (empty($userType) || empty($lrn) || empty($fullName) || empty($birthMonth) || empty($birthDay) || empty($birthYear) || empty($password) || empty($confirmPassword)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

// Validate password match
if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['error' => 'Passwords do not match']);
    exit;
}

// Validate password strength
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters long']);
    exit;
}

// Format birthdate
$birthdate = $birthYear . '-' . str_pad($birthMonth, 2, '0', STR_PAD_LEFT) . '-' . str_pad($birthDay, 2, '0', STR_PAD_LEFT);

try {
    // Check if users table exists, if not create it
    $checkTable = "SHOW TABLES LIKE 'users'";
    $tableExists = $conn->query($checkTable);
    
    if ($tableExists->num_rows == 0) {
        // Create users table
        $createTable = "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lrn VARCHAR(20) UNIQUE NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            user_type ENUM('student', 'faculty', 'clinic') NOT NULL,
            date_of_birth DATE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->query($createTable);
    }
    
    // Check if user already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE lrn = ?");
    $stmt->bind_param("s", $lrn);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'User with this LRN already exists']);
        exit;
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $insertStmt = $conn->prepare("INSERT INTO users (lrn, full_name, user_type, date_of_birth, password_hash) VALUES (?, ?, ?, ?, ?)");
    $insertStmt->bind_param("sssss", $lrn, $fullName, $userType, $birthdate, $passwordHash);
    
    if ($insertStmt->execute()) {
        // Start session and store user data
        session_start();
        $_SESSION['user_id'] = $conn->insert_id;
        $_SESSION['lrn'] = $lrn;
        $_SESSION['full_name'] = $fullName;
        $_SESSION['user_type'] = $userType;
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => $conn->insert_id,
                'lrn' => $lrn,
                'full_name' => $fullName,
                'user_type' => $userType
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create user account']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$stmt->close();
$insertStmt->close();
$conn->close();
?> 