<?php
// 1. Database Connection Configuration
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
    // 2. Establish connection to MariaDB
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // 3. Query the players table (sorting by partcipationPoints descending)
    $stmt = $pdo->query("SELECT * FROM `players`  ORDER BY `winPoints` DESC");
    $players = $stmt->fetchAll();

} catch (\PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Essential for handling default mobile zoom and setting scale to 1:1 -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kihumbas Cup - Player Standings</title>
    <style>
        /* Modern Reset & Fluid Baseline */
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background-color: #f4f6f9; 
            color: #333;
            margin: 0;
            padding: 1rem; 
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        /* Container scales fluidly and stays safely within viewport boundaries */
        .leaderboard-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }

        h2 { 
            font-size: 1.5rem;
            color: #1b5e20;
            margin: 1rem 0;
            text-align: center;
        }

        /* The Magic Wrapper: If zoom forces the table to grow wider than the screen, 
           this card captures it safely and allows horizontal scrolling inside the card only. */
        .table-wrapper {
            width: 100%;
            background: #ffffff; 
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
            overflow-x: auto;
            -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS Safari */
            border: 1px solid #e0e0e0;
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            white-space: nowrap; /* Prevents awkward multi-line text wrapping when squeezed */
        }

        th, td { 
            padding: 1rem; 
            text-align: left; 
            font-size: 0.95rem;
        }

        th { 
            background-color: #2e7d32; 
            color: white; 
            font-weight: 600;
            letter-spacing: 0.5px;
            position: sticky;
            top: 0;
        }

        tr {
            border-bottom: 1px solid #edf2f7;
        }

        tr:last-child {
            border-bottom: none;
        }

        tr:hover { 
            background-color: #f8fafc; 
        }

        .player-name {
            color: #1a1a1a;
            font-weight: 600;
        }

        .initials-tag {
            background-color: #e8f5e9;
            color: #2e7d32;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.85rem;
        }

        .highlight { 
            font-weight: bold; 
            color: #2e7d32; 
            background-color: #e8f5e9;
            padding: 0.35rem 0.6rem;
            border-radius: 6px;
            display: inline-block;
        }
    </style>
</head>
<body>

    <div class="leaderboard-container">
        <h2>🏆 Kihumbas Cup Player Leaderboard</h2>

        <!-- Table wrapper guards the layout from layout shifts caused by high text/page zoom -->
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Initials</th>
                        <th>partcipationPoints</th>
                        <th>totalGames</th>
                        <th>days</th>
                        <th>Win Points</th>
                        <th>Avg PP / Game</th>
                        <th>Games Won</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($players)): ?>
                        <?php foreach ($players as $player): ?>
                            <tr>
                                <td><span class="player-name"><?= htmlspecialchars($player['name']) ?></span></td>
                                <td><span class="initials-tag"><?= htmlspecialchars($player['initials']) ?></span></td>
                                <td><?= htmlspecialchars($player['partcipationPoints']) ?></td>
                                <td><?= htmlspecialchars($player['totalGames']) ?></td>
                                <td><?= htmlspecialchars($player['days']) ?></td>
                                <td><?= htmlspecialchars($player['winPoints']) ?></td>
                                <td>
                                    <span class="highlight">
                                        <?= $player['AverageofPP'] !== null ? number_format($player['AverageofPP'], 2) : '0.00' ?>
                                    </span>
                                </td>
                                
                                <td><?= htmlspecialchars($player['gamesWon']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="5" style="text-align: center; color: #718096; padding: 2rem;">No players found in the database.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

</body>
</html>
