<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed."]);
    exit();
}

// --- Database Configuration Configuration ---
$host    = '127.0.0.1';
$db      = 'kihumbascup';
$user    = 'root';       // Default XAMPP username
$pass    = '';           // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit();
}

// --- Process Payload JSON Input ---
$jsonInput = file_get_contents('php://input');
$data = json_decode($jsonInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload format."]);
    exit();
}

try {
    // Begin transaction for safe multi-row insertions
    $pdo->beginTransaction();

    // Prepare statement conforming to your specific schema fields
    $sql = "INSERT INTO players (name, points, average, games, days, intials) 
            VALUES (:name, :points, :average, :games, :days, :intials)";
    $stmt = $pdo->prepare($sql);

    foreach ($data as $player) {
        if (isset($player['name']) && isset($player['points'])) {
            
            // Clean up basic string values
            $name = trim($player['name']);
            $points = floatval($player['points']);
            
            // Collect fallback values for extra schema fields if not provided in payload
            $average  = isset($player['average'])  ? floatval($player['average']) : null;
            $games    = isset($player['games'])    ? intval($player['games'])     : null;
           $days     = isset($player['days'])     ? intval($player['days']) : null;

            $initials = isset($player['initials']) ? substr(trim($player['initials']), 0, 10) : null;

            $stmt->execute([
                ':name'    => $name,
                ':points'  => $points,
                ':average' => $average,
                ':games'   => $games,
                ':days'    => $days,
                ':intials' => $initials // matches structural spelling 'intials' in your schema
            ]);
        }
    }

    $pdo->commit();

    // Fetch the updated full leaderboard from database to return ordered results
    $query = $pdo->query("SELECT name, points FROM players ORDER BY points DESC");
    $leaderboard = $query->fetchAll();

    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "message" => "Standings saved directly to database.",
        "data"    => $leaderboard
    ]);

} catch (Exception $e) {
    // Rollback changes if any statement failure triggers an exception
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database save execution failed: " . $e->getMessage()]);
}
