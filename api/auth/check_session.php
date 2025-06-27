<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['lrn']) && isset($_SESSION['user_type'])) {
    echo json_encode([
        'success' => true,
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'lrn' => $_SESSION['lrn'],
            'full_name' => $_SESSION['full_name'] ?? '',
            'user_type' => $_SESSION['user_type']
        ]
    ]);
} else {
    echo json_encode([
        'success' => true,
        'logged_in' => false,
        'message' => 'User not logged in'
    ]);
}
?> 