<?php
include '../../config/db_conn.php';

$data = json_decode(file_get_contents("php://input"), true);
$lrn = $data['lrn'];

// Delete related records first due to foreign key constraints
$conn->query("DELETE FROM student_medical_conditions WHERE student_lrn='$lrn'");
$conn->query("DELETE FROM dental_records WHERE student_lrn='$lrn'");
$conn->query("DELETE FROM visit_logs WHERE student_lrn='$lrn'");

$sql = "DELETE FROM students WHERE lrn=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $lrn);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
$conn->close();
?>