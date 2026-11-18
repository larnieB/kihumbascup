<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$identifier = trim($data['identifier'] ?? ''); // Can be username, email, or phone
$password   = $data['password'] ?? '';

if (!$identifier || !$password) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter your credentials.']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, username, phoneNumber, email, hashedPassword, balance FROM users WHERE email = ? OR username = ? OR phoneNumber = ? LIMIT 1");
$stmt->execute([$identifier, $identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['hashedPassword'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid login details.']);
    exit;
}

$_SESSION['user_id'] = $user['id'];

echo json_encode([
    'status' => 'success',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'phoneNumber' => $user['phoneNumber'],
        'email' => $user['email'],
        'balance' => $user['balance'] ?? 0.00
    ]
]);
