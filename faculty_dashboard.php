<?php
session_start();
if (!isset($_SESSION['faculty_id'])) {
    header('Location: login.php?type=faculty');
    exit();
}
require 'includes/db.php';
// Fetch faculty info
$faculty_id = $_SESSION['faculty_id'];
$faculty_sql = "SELECT first_name, middle_name, last_name FROM faculty WHERE faculty_id = ?";
$stmt = $conn->prepare($faculty_sql);
$stmt->bind_param('i', $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$faculty_full_name = htmlspecialchars(trim($faculty['first_name'] . ' ' . $faculty['middle_name'] . ' ' . $faculty['last_name']));
// Placeholder stats and activity
$total_students = 320;
$my_sections = 3;
$pending_reports = 2;
$recent_activity = [
    ["Submitted health report for Grade 8-B", "30 minutes ago"],
    ["Viewed student record for Ana Santos (Grade 7-C)", "1 hour ago"],
    ["Updated class medical info", "Yesterday, 3:10 PM"]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Dashboard - PDMHS</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            color: #fff;
        }
        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 280px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255,255,255,0.2);
            padding: 30px 0;
            display: flex;
            flex-direction: column;
        }
        .logo-section {
            display: flex;
            align-items: center;
            padding: 0 30px;
            margin-bottom: 40px;
        }
        .logo-section img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            margin-right: 15px;
        }
        .logo-text {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
        }
        .nav-menu {
            flex: 1;
            padding: 0 20px;
        }
        .nav-item {
            display: flex;
            align-items: center;
            padding: 15px 25px;
            margin-bottom: 8px;
            border-radius: 16px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
        }
        .nav-item:hover, .nav-item.active {
            background: rgba(255,255,255,0.15);
            color: #fff;
            transform: translateX(5px);
        }
        .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 24px;
            background: #fff;
            border-radius: 2px;
        }
        .nav-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 24px;
            text-align: center;
        }
        .main-content {
            flex: 1;
            padding: 40px 40px 40px 40px;
            overflow-y: auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            padding: 25px 30px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .welcome-section {
            flex: 1;
        }
        .welcome-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .welcome-subtitle {
            font-size: 16px;
            color: rgba(255,255,255,0.8);
            font-weight: 400;
        }
        .user-profile {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 2px solid rgba(255,255,255,0.3);
        }
        .user-info h4 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .user-info p {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .card-header {
            background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
            padding: 25px 30px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .card-title {
            font-size: 20px;
            font-weight: 600;
            color: #fff;
        }
        .card-body {
            padding: 0 30px 30px 30px;
        }
        .badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .badge { background: #3b82f6; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-block; }
        .badge-section { background: #5fc9c4; }
        .badge-report { background: #f59e0b; }
        .notification-list { display: flex; flex-direction: column; gap: 12px; }
        .notification-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(255,255,255,0.08); border-radius: 8px; border-left: 4px solid #3b82f6; }
        .notification-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; margin-top: 6px; flex-shrink: 0; }
        .notification-content { flex: 1; }
        .notification-text { font-weight: 500; margin-bottom: 2px; }
        .notification-time { font-size: 12px; color: #e0e7ff; }
        @media (max-width: 1100px) {
            .dashboard-grid { grid-template-columns: 1fr; }
            .main-content { padding: 20px; }
        }
        @media (max-width: 900px) {
            .dashboard-container { flex-direction: column; }
            .sidebar { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.2); flex-direction: row; padding: 10px 0; }
            .logo-section { margin-bottom: 0; }
            .nav-menu { flex-direction: row; padding: 0 10px; }
            .nav-item { margin-bottom: 0; margin-right: 8px; }
        }
        @media (max-width: 600px) {
            .main-content { padding: 10px; }
            .card-header, .card-body { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <aside class="sidebar">
            <div class="logo-section">
                <a href="index.php"><img src="assets/pdmhs_logo.png" alt="PDMHS Logo"></a>
                <span class="logo-text">PDMHS</span>
            </div>
            <div class="nav-menu">
                <a href="faculty_dashboard.php" class="nav-item active"><span class="nav-icon"><i class="fa fa-home"></i></span> Dashboard</a>
                <a href="faculty_student_records.php" class="nav-item"><span class="nav-icon"><i class="fa fa-users"></i></span> Student Records</a>
                <a href="faculty_reports.php" class="nav-item"><span class="nav-icon"><i class="fa fa-file-medical"></i></span> Reports</a>
                <a href="faculty_settings.php" class="nav-item"><span class="nav-icon"><i class="fa fa-cog"></i></span> Settings</a>
            </div>
            <div style="margin-top:auto; padding: 0 20px;">
                <hr style="border: 1px solid rgba(255,255,255,0.15); margin: 20px 0;">
                <a href="logout.php" class="nav-item" style="color:#ef4444;"><span class="nav-icon"><i class="fa fa-sign-out-alt"></i></span> Logout</a>
            </div>
        </aside>
        <main class="main-content">
            <div class="header">
                <div class="welcome-section">
                    <div class="welcome-title">Welcome, <?php echo $faculty_full_name; ?>!</div>
                    <div class="welcome-subtitle">Manage student health records and reports</div>
                </div>
                <div class="user-profile">
                    <div class="user-avatar"><i class="fa fa-user-tie"></i></div>
                    <div class="user-info">
                        <h4><?php echo $faculty_full_name; ?></h4>
                        <p>Faculty</p>
                    </div>
                </div>
            </div>
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header"><i class="fa fa-chart-bar card-icon"></i> <span class="card-title">Quick Stats</span></div>
                    <div class="card-body">
                        <div style="display: flex; flex-wrap: wrap; gap: 18px 32px; align-items: center; font-size: 1.08rem;">
                            <span><b>Sections:</b> <span class="badge badge-section"><?php echo $my_sections; ?></span></span>
                            <span><b>Total Students:</b> <span class="badge"><?php echo $total_students; ?></span></span>
                            <span><b>Pending Reports:</b> <span class="badge badge-report"><?php echo $pending_reports; ?></span></span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><i class="fa fa-bolt card-icon"></i> <span class="card-title">Quick Actions</span></div>
                    <div class="card-body">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <button style="width:100%;background:rgba(255,255,255,0.08);border:none;padding:18px 0;font-size:1.08rem;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background 0.2s;border-radius:8px;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'" ><span class="nav-icon"><i class="fa fa-users"></i></span> View Students</button>
                            <button style="width:100%;background:rgba(255,255,255,0.08);border:none;padding:18px 0;font-size:1.08rem;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background 0.2s;border-radius:8px;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'" ><span class="nav-icon"><i class="fa fa-file-medical"></i></span> Reports</button>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><i class="fa fa-bell card-icon"></i> <span class="card-title">Recent Activity</span></div>
                    <div class="card-body">
                        <div class="notification-list">
                            <?php foreach ($recent_activity as $act) { ?>
                            <div class="notification-item">
                                <div class="notification-dot"></div>
                                <div class="notification-content">
                                    <div class="notification-text"><?php echo htmlspecialchars($act[0]); ?></div>
                                    <div class="notification-time"><?php echo htmlspecialchars($act[1]); ?></div>
                                </div>
                            </div>
                            <?php } ?>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html> 