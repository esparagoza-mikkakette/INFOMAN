<?php
include '../../config/db_conn.php';
$lrn = isset($_GET['lrn']) ? $_GET['lrn'] : '';

if ($lrn) {
    $sql = "SELECT * FROM students WHERE lrn = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $lrn);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
} else {
    $sql = "SELECT * FROM students";
    $result = $conn->query($sql);
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    echo json_encode($students);
}
$conn->close();
?>