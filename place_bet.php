<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Please log in first.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$userId          = $_SESSION['user_id'];
$player          = trim($data['player'] ?? 'Any Player');
$ball            = trim($data['ball'] ?? 'Any Ball');
$pocket          = trim($data['pocket'] ?? 'Any Pocket');
$odds            = floatval($data['odds'] ?? 0);
$stake           = floatval($data['stake'] ?? 0);
$potentialPayout = floatval($data['potentialPayout'] ?? 0);

if ($stake <= 0 || $odds <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid stake or odds.']);
    exit;
}

try {
    // 1. Verify there is an active game and grab its ID
    $gameStmt = $pdo->query("SELECT id FROM games WHERE active = 1 ORDER BY id DESC LIMIT 1");
    $activeGame = $gameStmt->fetch();

    if (!$activeGame) {
        echo json_encode(['status' => 'error', 'message' => 'No active game is currently open for betting.']);
        exit;
    }

    $gameId = $activeGame['id'];

    $pdo->beginTransaction();

    // 2. Lock user row to verify and deduct balance safely
    $stmt = $pdo->prepare("SELECT balance FROM users WHERE id = ? FOR UPDATE");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || floatval($user['balance']) < $stake) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Insufficient wallet balance.']);
        exit;
    }

    $newBalance = floatval($user['balance']) - $stake;

    $update = $pdo->prepare("UPDATE users SET balance = ? WHERE id = ?");
    $update->execute([$newBalance, $userId]);

    // 3. Record the bet linked to $gameId
    $insert = $pdo->prepare("
        INSERT INTO bets (user_id, game_id, player, ball, pocket, odds, stake, potential_payout)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$userId, $gameId, $player, $ball, $pocket, $odds, $stake, $potentialPayout]);

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'gameId' => $gameId,
        'newBalance' => number_format($newBalance, 2, '.', '')
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to process bet.']);
}
