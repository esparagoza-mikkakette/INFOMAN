<?php
require 'includes/db.php';
session_start();
$type = $_GET['type'] ?? 'student';
$success = $error = '';
function clean($str) {
    return htmlspecialchars(trim($str));
}
// Fetch grade levels and sections into arrays
$grade_levels_res = $conn->query("SELECT grade_level_id, level_name FROM grade_levels ORDER BY level_name");
$grade_levels = [];
while ($row = $grade_levels_res->fetch_assoc()) $grade_levels[] = $row;
$sections_res = $conn->query("SELECT section_id, section_name FROM sections ORDER BY section_name");
$sections = [];
while ($row = $sections_res->fetch_assoc()) $sections[] = $row;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = $_POST['type'];
    if ($type === 'student') {
        $lrn = clean($_POST['lrn'] ?? '');
        $first_name = clean($_POST['first_name'] ?? '');
        $middle_name = clean($_POST['middle_name'] ?? '');
        $last_name = clean($_POST['last_name'] ?? '');
        $birthdate = clean($_POST['birthdate'] ?? '');
        $gender = clean($_POST['gender'] ?? '');
        $address = clean($_POST['address'] ?? '');
        $password = $_POST['password'] ?? '';
        if ($lrn === '') {
            $error = 'LRN is required.';
        } elseif ($first_name === '') {
            $error = 'First name is required.';
        } elseif ($last_name === '') {
            $error = 'Last name is required.';
        } elseif ($birthdate === '') {
            $error = 'Birthdate is required.';
        } elseif ($gender === '') {
            $error = 'Gender is required.';
        } elseif (strlen($password) < 6) {
            $error = 'Password must be at least 6 characters.';
        } else {
            // Check LRN uniqueness
            $check = $conn->prepare('SELECT lrn FROM students WHERE lrn = ?');
            $check->bind_param('s', $lrn);
            $check->execute();
            $check->store_result();
            if ($check->num_rows > 0) {
                $error = 'This LRN is already registered.';
            } else {
                $password_hash = password_hash($password, PASSWORD_DEFAULT);
                $sql = "INSERT INTO students (lrn, first_name, middle_name, last_name, birthdate, gender, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ssssssss', $lrn, $first_name, $middle_name, $last_name, $birthdate, $gender, $address, $password_hash);
                if ($stmt->execute()) {
                    $_SESSION['student_id'] = $conn->insert_id;
                    header('Location: student_dashboard.php');
                    exit();
                } else {
                    $error = 'Registration failed: ' . $conn->error;
                }
            }
        }
    } elseif ($type === 'faculty') {
        $first_name = clean($_POST['first_name'] ?? '');
        $middle_name = clean($_POST['middle_name'] ?? '');
        $last_name = clean($_POST['last_name'] ?? '');
        $username = clean($_POST['username'] ?? '');
        $subject = clean($_POST['subject'] ?? '');
        $grade_level_id = clean($_POST['grade_level_id'] ?? '');
        $section_id = clean($_POST['section_id'] ?? '');
        $password = $_POST['password'] ?? '';
        if ($first_name === '') {
            $error = 'First name is required.';
        } elseif ($last_name === '') {
            $error = 'Last name is required.';
        } elseif ($username === '') {
            $error = 'Username is required.';
        } elseif ($subject === '') {
            $error = 'Subject is required.';
        } elseif ($grade_level_id === '') {
            $error = 'Grade level is required.';
        } elseif ($section_id === '') {
            $error = 'Section is required.';
        } elseif (strlen($password) < 6) {
            $error = 'Password must be at least 6 characters.';
        } else {
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO faculty (first_name, middle_name, last_name, username, password, subject, grade_level_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ssssssii', $first_name, $middle_name, $last_name, $username, $password_hash, $subject, $grade_level_id, $section_id);
            if ($stmt->execute()) {
                $faculty_id = $conn->insert_id;
                $_SESSION['faculty_id'] = $faculty_id;
                header('Location: faculty_dashboard.php');
                exit();
            } else {
                $error = 'Registration failed: ' . $conn->error;
            }
        }
    } elseif ($type === 'clinic') {
        $first_name = clean($_POST['first_name'] ?? '');
        $middle_name = clean($_POST['middle_name'] ?? '');
        $last_name = clean($_POST['last_name'] ?? '');
        $username = clean($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        if ($first_name === '') {
            $error = 'First name is required.';
        } elseif ($last_name === '') {
            $error = 'Last name is required.';
        } elseif ($username === '') {
            $error = 'Username is required.';
        } elseif (strlen($password) < 6) {
            $error = 'Password must be at least 6 characters.';
        } else {
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO clinic_staff (first_name, middle_name, last_name, username, password) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('sssss', $first_name, $middle_name, $last_name, $username, $password_hash);
            if ($stmt->execute()) {
                $clinic_id = $conn->insert_id;
                $_SESSION['clinic_id'] = $clinic_id;
                header('Location: clinic_dashboard.php');
                exit();
            } else {
                $error = 'Registration failed: ' . $conn->error;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - PDMHS</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="overlay">
        <a href="index.php"><img src="assets/pdmhs_logo.png" alt="PDMHS Logo" class="logo"></a>
        <div class="school-title">President Diosdado Macapagal High School</div>
        <div class="school-desc">Student Medical Record System</div>
        <div style="font-size: 0.98rem; color: #444; margin-bottom: 10px;">Sign up to create your account</div>
        <?php if ($error) echo '<div class="msg-error">'.$error.'</div>'; ?>
        <form method="post" autocomplete="off" style="width:100%;max-width:340px;">
            <input type="hidden" name="type" value="<?php echo htmlspecialchars($type); ?>">
            <?php if ($type === 'student') { ?>
            <div class="form-group"><input type="text" name="lrn" placeholder="Student LRN" required></div>
            <div class="form-group"><input type="text" name="first_name" placeholder="First Name" required></div>
            <div class="form-group"><input type="text" name="middle_name" placeholder="Middle Name"></div>
            <div class="form-group"><input type="text" name="last_name" placeholder="Last Name" required></div>
            <div class="form-group"><input type="date" name="birthdate" placeholder="Birthdate" required></div>
            <div class="form-group">
                <select name="gender" required style="width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;">
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
            <div class="form-group"><input type="text" name="address" placeholder="Address"></div>
            <div class="form-group"><input type="password" name="password" placeholder="Password" required minlength="6"></div>
            <!-- Grade Level Radios -->
            <div class="form-group">
                <label><b>Grade Level:</b></label><br>
                <?php foreach($grade_levels as $gl): ?>
                    <label>
                        <input type="radio" name="grade_level_id" value="<?php echo $gl['grade_level_id']; ?>" required
                            onclick="toggleStrand(this)">
                        <?php echo htmlspecialchars($gl['level_name']); ?>
                    </label>
                <?php endforeach; ?>
            </div>

            <!-- Section Radios -->
            <div class="form-group">
                <label><b>Section:</b></label><br>
                <?php foreach($sections as $sec): ?>
                    <label>
                        <input type="radio" name="section_id" value="<?php echo $sec['section_id']; ?>" required>
                        <?php echo htmlspecialchars($sec['section_name']); ?>
                    </label>
                <?php endforeach; ?>
            </div>

            <!-- Strand Radios (hidden by default) -->
            <div class="form-group" id="strand-group" style="display:none;">
                <label><b>Strand (for Grade 11/12):</b></label><br>
                <?php foreach(['ABM','HUMSS','TVL HE','STEM'] as $strand): ?>
                    <label>
                        <input type="radio" name="strand" value="<?php echo $strand; ?>">
                        <?php echo $strand; ?>
                    </label>
                <?php endforeach; ?>
            </div>
            <?php } elseif ($type === 'faculty') { ?>
            <div class="form-group"><input type="text" name="first_name" placeholder="First Name" required></div>
            <div class="form-group"><input type="text" name="middle_name" placeholder="Middle Name"></div>
            <div class="form-group"><input type="text" name="last_name" placeholder="Last Name" required></div>
            <div class="form-group"><input type="text" name="username" placeholder="Username" required></div>
            <div class="form-group"><input type="text" name="subject" placeholder="Subject" required></div>
            <div class="form-group">
                <select name="grade_level_id" required style="width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;">
                    <option value="">Select Grade Level</option>
                    <?php foreach($grade_levels as $gl) { ?>
                        <option value="<?php echo $gl['grade_level_id']; ?>"><?php echo htmlspecialchars($gl['level_name']); ?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="form-group">
                <select name="section_id" required style="width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;">
                    <option value="">Select Section</option>
                    <?php foreach($sections as $sec) { ?>
                        <option value="<?php echo $sec['section_id']; ?>"><?php echo htmlspecialchars($sec['section_name']); ?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="form-group"><input type="password" name="password" placeholder="Password" required minlength="6"></div>
            <?php } elseif ($type === 'clinic') { ?>
            <div class="form-group"><input type="text" name="first_name" placeholder="First Name" required></div>
            <div class="form-group"><input type="text" name="middle_name" placeholder="Middle Name"></div>
            <div class="form-group"><input type="text" name="last_name" placeholder="Last Name" required></div>
            <div class="form-group"><input type="text" name="username" placeholder="Username" required></div>
            <div class="form-group"><input type="password" name="password" placeholder="Password" required minlength="6"></div>
            <?php } ?>
            <button type="submit" class="signin-btn" style="margin-top:10px;">Register</button>
        </form>
        <a href="register_landing.php" class="forgot" style="display:block;text-align:center;margin-top:15px;">&larr; Back to Register Options</a>
        <a href="login_landing.php" class="forgot" style="display:block;text-align:center;margin-top:5px;">&larr; Back to Login</a>
    </div>
    <script>
    function toggleStrand(radio) {
        // Get the selected grade level's text
        var gradeId = radio.value;
        var gradeText = radio.parentNode.textContent.trim();
        var strandGroup = document.getElementById('strand-group');
        if (gradeText === 'Grade 11' || gradeText === 'Grade 12') {
            strandGroup.style.display = '';
            // Make strand required
            Array.from(strandGroup.querySelectorAll('input')).forEach(i => i.required = true);
        } else {
            strandGroup.style.display = 'none';
            // Remove required if not needed
            Array.from(strandGroup.querySelectorAll('input')).forEach(i => i.required = false);
        }
    }
    </script>
</body>
</html> 