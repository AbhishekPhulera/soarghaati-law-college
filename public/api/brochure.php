<?php
/**
 * Soarghaati Law College - Official Brochure Management API
 * Handles secure brochure PDF uploads, storage monitoring, and physical deletion
 * to optimize server hosting disk space.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/site-config.json';
$uploadDir = $baseDir . '/uploads/brochure';

// Ensure uploads directory exists
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Ensure security in uploads dir
$uploadHtaccess = $uploadDir . '/.htaccess';
if (!file_exists($uploadHtaccess)) {
    // Allow direct download of PDF, deny script execution
    $htContent = "<FilesMatch \"\\.(?i:php|phtml|php3|php4|php5|php7|phps|cgi|pl|sh)\$\">\nRequire all denied\n</FilesMatch>\n";
    @file_put_contents($uploadHtaccess, $htContent);
}

/**
 * Format bytes into human readable format
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

/**
 * Helper to update site-config.json safely
 */
function updateConfigBrochure($configFile, $brochureUrl, $fileName = '', $fileSize = '', $uploadedAt = '') {
    if (!file_exists($configFile)) return false;
    $raw = @file_get_contents($configFile);
    $config = json_decode($raw, true);
    if (!$config || !is_array($config)) return false;

    if (!isset($config['institution']) || !is_array($config['institution'])) {
        $config['institution'] = [];
    }

    $config['institution']['brochureUrl'] = $brochureUrl;
    $config['institution']['brochureFileName'] = $fileName;
    $config['institution']['brochureFileSize'] = $fileSize;
    $config['institution']['brochureUploadedAt'] = $uploadedAt;

    return @file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

$method = $_SERVER['REQUEST_METHOD'];

// -----------------------------------------------------------------------------
// 1. GET: Check current brochure status & file info
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $brochureUrl = '';
    $fileName = '';
    $fileSize = '';
    $uploadedAt = '';

    if (file_exists($configFile)) {
        $cfg = json_decode(@file_get_contents($configFile), true);
        if ($cfg && isset($cfg['institution'])) {
            $brochureUrl = $cfg['institution']['brochureUrl'] ?? '';
            $fileName = $cfg['institution']['brochureFileName'] ?? '';
            $fileSize = $cfg['institution']['brochureFileSize'] ?? '';
            $uploadedAt = $cfg['institution']['brochureUploadedAt'] ?? '';
        }
    }

    $existsOnDisk = false;
    $actualSizeBytes = 0;

    if ($brochureUrl) {
        $cleanPath = ltrim(parse_url($brochureUrl, PHP_URL_PATH), '/');
        $fullPath = $baseDir . '/' . $cleanPath;
        if (file_exists($fullPath)) {
            $existsOnDisk = true;
            $actualSizeBytes = @filesize($fullPath);
            if (!$fileSize && $actualSizeBytes > 0) {
                $fileSize = formatBytes($actualSizeBytes);
            }
            if (!$fileName) {
                $fileName = basename($fullPath);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'exists' => $existsOnDisk,
        'url' => $brochureUrl,
        'fileName' => $fileName,
        'fileSize' => $fileSize,
        'sizeBytes' => $actualSizeBytes,
        'uploadedAt' => $uploadedAt
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. POST: Upload or Delete
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    // Check if JSON request body contains action
    if (!$action) {
        $raw = @file_get_contents('php://input');
        if ($raw) {
            $json = json_decode($raw, true);
            if ($json && isset($json['action'])) {
                $action = $json['action'];
            }
        }
    }

    // A. DELETE ACTION: Physically delete PDF from server storage to free space
    if ($action === 'delete') {
        // Find and delete any existing files in uploads/brochure/
        $deletedCount = 0;
        if (is_dir($uploadDir)) {
            $files = glob($uploadDir . '/*');
            foreach ($files as $f) {
                if (is_file($f) && basename($f) !== '.htaccess') {
                    if (@unlink($f)) {
                        $deletedCount++;
                    }
                }
            }
        }

        // Also check if brochureUrl pointed to a root file or legacy file
        if (file_exists($configFile)) {
            $cfg = json_decode(@file_get_contents($configFile), true);
            $oldUrl = $cfg['institution']['brochureUrl'] ?? '';
            if ($oldUrl && strpos($oldUrl, '/uploads/brochure/') === false) {
                $oldPath = $baseDir . '/' . ltrim(parse_url($oldUrl, PHP_URL_PATH), '/');
                if (file_exists($oldPath) && is_file($oldPath) && strpos(basename($oldPath), 'Brochure') !== false) {
                    @unlink($oldPath);
                }
            }
        }

        // Clear brochure fields in site-config.json
        updateConfigBrochure($configFile, '', '', '', '');

        echo json_encode([
            'success' => true,
            'message' => 'Brochure PDF permanently deleted from server storage to free hosting space.',
            'deletedFiles' => $deletedCount
        ]);
        exit;
    }

    // B. UPLOAD ACTION: Save uploaded PDF file
    if (!isset($_FILES['brochure']) && !isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No brochure file was uploaded.']);
        exit;
    }

    $file = $_FILES['brochure'] ?? $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        $errMsg = 'File upload failed with error code: ' . $file['error'];
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
            $errMsg = 'File is too large. Maximum allowed size is 50MB.';
        }
        echo json_encode(['success' => false, 'error' => $errMsg]);
        exit;
    }

    // Validate size (max 50 MB)
    $maxBytes = 50 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File size exceeds 50MB limit.']);
        exit;
    }

    // Validate extension & MIME type (Must be PDF)
    $originalName = $file['name'];
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Only PDF files (.pdf) are allowed.']);
        exit;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, $file['tmp_name']) : '';
    if ($finfo) finfo_close($finfo);

    if ($mimeType && !in_array($mimeType, ['application/pdf', 'application/x-pdf', 'application/octet-stream'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file type. File must be a valid PDF.']);
        exit;
    }

    // Clean previous files in upload directory to preserve hosting disk space
    if (is_dir($uploadDir)) {
        $oldFiles = glob($uploadDir . '/*');
        foreach ($oldFiles as $old) {
            if (is_file($old) && basename($old) !== '.htaccess') {
                @unlink($old);
            }
        }
    }

    // Generate safe clean filename
    $safeBaseName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    if (empty($safeBaseName)) $safeBaseName = 'Soarghaati_Law_College_Brochure';
    $targetFileName = $safeBaseName . '_' . date('Ymd_His') . '.pdf';
    $targetPath = $uploadDir . '/' . $targetFileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save uploaded brochure file to disk.']);
        exit;
    }

    @chmod($targetPath, 0644);

    $relativeUrl = '/uploads/brochure/' . $targetFileName;
    $fileSizeFormatted = formatBytes(filesize($targetPath));
    $now = date('c');

    // Update site-config.json
    updateConfigBrochure($configFile, $relativeUrl, $originalName, $fileSizeFormatted, $now);

    echo json_encode([
        'success' => true,
        'message' => 'Brochure uploaded successfully and published to live website.',
        'data' => [
            'url' => $relativeUrl,
            'fileName' => $originalName,
            'fileSize' => $fileSizeFormatted,
            'uploadedAt' => $now
        ]
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

