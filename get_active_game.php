<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'kihumbascup'; // Replace with your database name
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch the most recent active game
    $stmt = $pdo->query("SELECT id, noOfPlayers FROM games WHERE active = 1 ORDER BY id DESC LIMIT 1");
    $activeGame = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($activeGame) {
        echo json_encode([
            'status'      => 'success',
            'game_id'     => (int)$activeGame['id'],
            'noOfPlayers' => (int)$activeGame['noOfPlayers']
        ]);
    } else {
        echo json_encode([
            'status'  => 'empty',
            'message' => 'No active game found.'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
