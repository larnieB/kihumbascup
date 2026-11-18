<?php
// 1. Database configuration
$host = 'localhost';
$dbname = 'kihumbascup'; // Replace with your actual database name
$username = 'root';             // Default XAMPP/WAMP username
$password = '';                 // Default XAMPP/WAMP password is empty

// 2. Check if form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $numberOfPlayers = $_POST['num_players'] ?? null;

    // 3. Validate input
    if (!empty($numberOfPlayers) && is_numeric($numberOfPlayers) && $numberOfPlayers >= 2) {
        try {
            // 4. Connect to MySQL using PDO
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Optional: Deactivate any previously active games first
             $pdo->exec("UPDATE games SET active = 0 WHERE active = 1");

            // 5. Prepare and execute the INSERT query
            // Setting 'active' to 1 represents true for tinyint(1)
            $sql = "INSERT INTO games (noOfPlayers, active) VALUES (:noOfPlayers, :active)";
            $stmt = $pdo->prepare($sql);
            
            $stmt->execute([
                ':noOfPlayers' => (int)$numberOfPlayers,
                ':active'      => 1
            ]);

            // Get the auto-generated ID of the new game
            $newGameId = $pdo->lastInsertId();

            echo "Game #" . $newGameId . " started with " . htmlspecialchars($numberOfPlayers) . " players and set to active!";

        } catch (PDOException $e) {
            echo "Database error: " . $e->getMessage();
        }
    } else {
        echo "Please enter a valid number of players (minimum 2).";
    }
}
?>
