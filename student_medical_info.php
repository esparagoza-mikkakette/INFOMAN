<?php
session_start();
if (!isset($_SESSION['student_id'])) {
    header('Location: login.php');
    exit();
}
require 'includes/db.php';
$student_id = $_SESSION['student_id'];
// Fetch medical profile
$med_sql = "SELECT * FROM medical_profiles WHERE student_id = ?";
$stmt = $conn->prepare($med_sql);
$stmt->bind_param('i', $student_id);
$stmt->execute();
$medical = $stmt->get_result()->fetch_assoc();
$success = $error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $blood_type = $_POST['blood_type'] ?? '';
    $disability_status = $_POST['disability_status'] ?? '';
    $notes = $_POST['notes'] ?? '';
    if ($medical) {
        // Update
        $sql = "UPDATE medical_profiles SET blood_type=?, disability_status=?, notes=? WHERE student_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssi', $blood_type, $disability_status, $notes, $student_id);
        if ($stmt->execute()) {
            $success = 'Medical info updated.';
        } else {
            $error = 'Update failed.';
        }
    } else {
        // Insert
        $sql = "INSERT INTO medical_profiles (student_id, blood_type, disability_status, notes) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('isss', $student_id, $blood_type, $disability_status, $notes);
        if ($stmt->execute()) {
            $success = 'Medical info saved.';
        } else {
            $error = 'Save failed.';
        }
    }
    // Refresh data
    $stmt = $conn->prepare($med_sql);
    $stmt->bind_param('i', $student_id);
    $stmt->execute();
    $medical = $stmt->get_result()->fetch_assoc();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Info - PDMHS</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', sans-serif; color: #fff; }
        .container { max-width: 600px; margin: 60px auto; background: rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 40px; }
        h2 { font-size: 2rem; margin-bottom: 24px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; color: #e0e7ff; }
        input, textarea, select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.12); color: #fff; margin-bottom: 18px; font-size: 1rem; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #764ba2; background: rgba(255,255,255,0.18); }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 8px; padding: 14px 32px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn:hover { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }
        .msg-success { background: #22c55e; color: #fff; padding: 10px 18px; border-radius: 8px; margin-bottom: 18px; }
        .msg-error { background: #ef4444; color: #fff; padding: 10px 18px; border-radius: 8px; margin-bottom: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <h2><i class="fa fa-notes-medical"></i> My Medical Information</h2>
        <?php if ($success) echo '<div class="msg-success">' . $success . '</div>'; ?>
        <?php if ($error) echo '<div class="msg-error">' . $error . '</div>'; ?>
        <form method="post">
            <label for="blood_type">Blood Type</label>
            <input type="text" name="blood_type" id="blood_type" value="<?php echo htmlspecialchars($medical['blood_type'] ?? ''); ?>" maxlength="5">
            <label for="disability_status">Disability Status</label>
            <input type="text" name="disability_status" id="disability_status" value="<?php echo htmlspecialchars($medical['disability_status'] ?? ''); ?>" maxlength="100">
            <label for="notes">Notes</label>
            <textarea name="notes" id="notes" rows="4"><?php echo htmlspecialchars($medical['notes'] ?? ''); ?></textarea>
            <button type="submit" class="btn"><i class="fa fa-save"></i> Save</button>
        </form>
    </div>
</body>
</html> 