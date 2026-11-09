<?php
/**
 * Soarghaati Law College - Official Leads Database API
 * Stores, manages, and securely persists student admission leads in SQLite with JSON fallback.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

// Ensure security .htaccess exists in dataDir
$htaccessPath = $dataDir . '/.htaccess';
if (!file_exists($htaccessPath)) {
    @file_put_contents($htaccessPath, "Order Deny,Allow\nDeny from all\nRequire all denied\n");
}

$dbPath = $dataDir . '/leads.db';
$jsonPath = $dataDir . '/leads.json';

// Initialize SQLite PDO or fallback
$pdo = null;
try {
    if (extension_loaded('pdo_sqlite')) {
        $pdo = new PDO('sqlite:' . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT,
            course TEXT NOT NULL,
            percentage TEXT,
            state TEXT,
            city TEXT,
            status TEXT DEFAULT 'New',
            notes TEXT DEFAULT '',
            source TEXT DEFAULT 'Website Modal',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )");
    }
} catch (Exception $e) {
    $pdo = null;
}

/**
 * Fallback helpers for JSON storage if PDO SQLite is unavailable
 */
function readJsonLeads($path) {
    if (!file_exists($path)) return [];
    $raw = @file_get_contents($path);
    $arr = json_decode($raw, true);
    return is_array($arr) ? $arr : [];
}

function writeJsonLeads($path, $leads) {
    return @file_put_contents($path, json_encode($leads, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -----------------------------------------------------------------------------
// 1. GET: Fetch all leads
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM leads ORDER BY datetime(created_at) DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $leads = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'studentName' => $r['student_name'],
                    'mobile' => $r['mobile'],
                    'email' => $r['email'] ?? '',
                    'course' => $r['course'],
                    'percentage' => $r['percentage'] ?? '',
                    'state' => $r['state'] ?? '',
                    'city' => $r['city'] ?? '',
                    'status' => $r['status'] ?? 'New',
                    'notes' => $r['notes'] ?? '',
                    'source' => $r['source'] ?? 'Website Modal',
                    'createdAt' => $r['created_at'],
                    'updatedAt' => $r['updated_at']
                ];
            }, $rows);
            echo json_encode(['success' => true, 'data' => $leads]);
            exit;
        } catch (Exception $e) {
            // fallback to json
        }
    }

    $leads = readJsonLeads($jsonPath);
    echo json_encode(['success' => true, 'data' => $leads]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. POST / PUT: Create or Update lead
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
        exit;
    }

    // CLEAR ALL LEADS (Clean Slate)
    if ($action === 'clear' || (isset($data['action']) && $data['action'] === 'clear')) {
        if ($pdo) {
            try {
                $pdo->exec("DELETE FROM leads");
            } catch (Exception $e) {}
        }
        writeJsonLeads($jsonPath, []);
        echo json_encode(['success' => true, 'message' => 'All leads cleared successfully.']);
        exit;
    }

    // DELETE SINGLE LEAD
    if ($action === 'delete' || (isset($data['action']) && $data['action'] === 'delete')) {
        $id = trim($data['id'] ?? '');
        if ($id) {
            if ($pdo) {
                try {
                    $stmt = $pdo->prepare("DELETE FROM leads WHERE id = :id");
                    $stmt->execute([':id' => $id]);
                } catch (Exception $e) {}
            }
            $leads = readJsonLeads($jsonPath);
            $leads = array_values(array_filter($leads, function($l) use ($id) {
                return ($l['id'] ?? '') !== $id;
            }));
            writeJsonLeads($jsonPath, $leads);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // UPDATE STATUS / NOTES ACTION
    if ($action === 'update' || isset($data['action']) && $data['action'] === 'update') {
        $id = trim($data['id'] ?? '');
        $status = trim($data['status'] ?? '');
        $notes = $data['notes'] ?? null;
        $now = date('c');

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing lead ID']);
            exit;
        }

        if ($pdo) {
            try {
                if ($notes !== null) {
                    $stmt = $pdo->prepare("UPDATE leads SET status = :status, notes = :notes, updated_at = :updated_at WHERE id = :id");
                    $stmt->execute([':status' => $status, ':notes' => $notes, ':updated_at' => $now, ':id' => $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE leads SET status = :status, updated_at = :updated_at WHERE id = :id");
                    $stmt->execute([':status' => $status, ':updated_at' => $now, ':id' => $id]);
                }
                echo json_encode(['success' => true]);
                exit;
            } catch (Exception $e) {
                // fallback
            }
        }

        $leads = readJsonLeads($jsonPath);
        $found = false;
        foreach ($leads as &$lead) {
            if ($lead['id'] === $id) {
                if ($status) $lead['status'] = $status;
                if ($notes !== null) $lead['notes'] = $notes;
                $lead['updatedAt'] = $now;
                $found = true;
                break;
            }
        }
        if ($found) writeJsonLeads($jsonPath, $leads);
        echo json_encode(['success' => true]);
        exit;
    }

    // CREATE NEW LEAD
    $studentName = trim($data['studentName'] ?? $data['name'] ?? '');
    $mobile = trim($data['mobile'] ?? $data['phone'] ?? '');
    $email = trim($data['email'] ?? '');
    $course = trim($data['course'] ?? $data['program'] ?? '');
    $percentage = trim($data['percentage'] ?? $data['qualification'] ?? '');
    $state = trim($data['state'] ?? '');
    $city = trim($data['city'] ?? '');
    $source = trim($data['source'] ?? 'Website Modal');
    $now = date('c');

    if (empty($studentName) || empty($mobile)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Student name and mobile number are required.']);
        exit;
    }

    // Generate unique ID: SLC-2026-XXXXX
    $id = 'SLC-' . date('Y') . '-' . substr(strtoupper(bin2hex(random_bytes(3))), 0, 5);

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO leads (id, student_name, mobile, email, course, percentage, state, city, status, notes, source, created_at, updated_at)
                VALUES (:id, :name, :mobile, :email, :course, :percentage, :state, :city, 'New', '', :source, :created_at, :updated_at)");
            $stmt->execute([
                ':id' => $id,
                ':name' => $studentName,
                ':mobile' => $mobile,
                ':email' => $email,
                ':course' => $course,
                ':percentage' => $percentage,
                ':state' => $state,
                ':city' => $city,
                ':source' => $source,
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            // Sync with json backup
            $leads = readJsonLeads($jsonPath);
            array_unshift($leads, [
                'id' => $id,
                'studentName' => $studentName,
                'mobile' => $mobile,
                'email' => $email,
                'course' => $course,
                'percentage' => $percentage,
                'state' => $state,
                'city' => $city,
                'status' => 'New',
                'notes' => '',
                'source' => $source,
                'createdAt' => $now,
                'updatedAt' => $now
            ]);
            writeJsonLeads($jsonPath, $leads);

            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        } catch (Exception $e) {
            // fallback
        }
    }

    $leads = readJsonLeads($jsonPath);
    $newLead = [
        'id' => $id,
        'studentName' => $studentName,
        'mobile' => $mobile,
        'email' => $email,
        'course' => $course,
        'percentage' => $percentage,
        'state' => $state,
        'city' => $city,
        'status' => 'New',
        'notes' => '',
        'source' => $source,
        'createdAt' => $now,
        'updatedAt' => $now
    ];
    array_unshift($leads, $newLead);
    writeJsonLeads($jsonPath, $leads);

    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);

