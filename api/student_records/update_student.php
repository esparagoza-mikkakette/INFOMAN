<?php
include '../../config/db_conn.php';

$data = json_decode(file_get_contents("php://input"), true);

$lrn = $data['lrn'];
$full_name = $data['full_name'];
$grade_section = $data['grade_section'];
$date_of_birth = $data['date_of_birth'];
$guardian_name = $data['guardian_name'];
$guardian_phone = $data['guardian_phone'];

$sql = "UPDATE students SET full_name=?, grade_section=?, date_of_birth=?, guardian_name=?, guardian_phone=? WHERE lrn=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $full_name, $grade_section, $date_of_birth, $guardian_name, $guardian_phone, $lrn);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
$conn->close();
?>