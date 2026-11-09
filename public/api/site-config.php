<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$configFile = dirname(__DIR__) . '/site-config.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($configFile)) {
        echo file_get_contents($configFile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Config file not found']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        $decoded = json_decode($input);
        if ($decoded !== null) {
            file_put_contents($configFile, $input);
            echo json_encode(['success' => true]);
            exit;
        }
    }
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
