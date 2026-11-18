<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'guest']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, username, phoneNumber, email, balance FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if ($user) {
    $user['balance'] = $user['balance'] ?? 0.00;
    echo json_encode(['status' => 'success', 'user' => $user]);
} else {
    session_destroy();
    echo json_encode(['status' => 'guest']);
}
