<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username    = trim($data['username'] ?? '');
$phoneNumber = trim($data['phoneNumber'] ?? '');
$email       = trim($data['email'] ?? '');
$password    = $data['password'] ?? '';

if (!$username || !$phoneNumber || !$email || strlen($password) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required (password min 6 chars).']);
    exit;
}

if (strlen($username) > 20) {
    echo json_encode(['status' => 'error', 'message' => 'Username must be 20 characters or less.']);
    exit;
}

// Check if username, email, or phone already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ? OR phoneNumber = ?");
$stmt->execute([$username, $email, $phoneNumber]);
if ($stmt->fetch()) {
    echo json_encode(['status' => 'error', 'message' => 'Username, email, or phone number already registered.']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$initialBalance = 100.00;

$insert = $pdo->prepare("INSERT INTO users (username, phoneNumber, hashedPassword, email, balance) VALUES (?, ?, ?, ?, ?)");
$insert->execute([$username, $phoneNumber, $hashedPassword, $email, $initialBalance]);

$userId = $pdo->lastInsertId();
$_SESSION['user_id'] = $userId;

echo json_encode([
    'status' => 'success',
    'user' => [
        'id' => $userId,
        'username' => $username,
        'phoneNumber' => $phoneNumber,
        'email' => $email,
        'balance' => $initialBalance
    ]
]);
