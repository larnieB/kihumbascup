<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Prevents Nginx/ngrok from buffering the stream

require 'db.php';

// Close session write lock so other PHP requests from the same user aren't blocked
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

$lastSignature = null;

// Stream updates for up to 30 seconds per connection (browser auto-reconnects seamlessly)
$startTime = time();
while (time() - $startTime < 30) {
    if (connection_aborted()) {
        break;
    }

    $stmt = $pdo->query("SELECT id, noOfPlayers FROM games WHERE active = 1 ORDER BY id DESC LIMIT 1");
    $game = $stmt->fetch();

    $payload = $game
        ? ['status' => 'success', 'gameId' => (int)$game['id'], 'noOfPlayers' => (int)$game['noOfPlayers']]
        : ['status' => 'none', 'gameId' => null, 'noOfPlayers' => 0];

    $signature = json_encode($payload);

    // Only push data when the active game actually changes
    if ($signature !== $lastSignature) {
        echo "event: gameUpdate\n";
        echo "data: " . $signature . "\n\n";
        @ob_flush();
        @flush();
        $lastSignature = $signature;
    }

    sleep(2); // Check database every 2 seconds
}
