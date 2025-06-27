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
$birthMonth = $input['birthMonth'] ?? '';
$birthDay = $input['birthDay'] ?? '';
$birthYear = $input['birthYear'] ?? '';
$password = $input['password'] ?? '';

// Validate required fields
if (empty($userType) || empty($lrn) || empty($birthMonth) || empty($birthDay) || empty($birthYear) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
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
        
        // Insert default admin user
        $defaultPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $insertAdmin = "INSERT INTO users (lrn, full_name, user_type, date_of_birth, password_hash) 
                       VALUES ('admin', 'System Administrator', 'clinic', '1990-01-01', '$defaultPassword')";
        $conn->query($insertAdmin);
    }
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT id, lrn, full_name, user_type, password_hash FROM users WHERE lrn = ? AND date_of_birth = ? AND user_type = ?");
    $stmt->bind_param("sss", $lrn, $birthdate, $userType);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials or user not found']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid password']);
        exit;
    }
    
    // Start session and store user data
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['lrn'] = $user['lrn'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['user_type'] = $user['user_type'];
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'lrn' => $user['lrn'],
            'full_name' => $user['full_name'],
            'user_type' => $user['user_type']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?> 