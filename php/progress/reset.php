<?php
// POST (connecté) : efface la progression et les scores de L'UTILISATEUR CONNECTÉ uniquement.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_method('POST');
$user = require_login();

$pdo = db();
$pdo->prepare('DELETE FROM progress WHERE user_id = ?')->execute([(int) $user['id']]);
$pdo->prepare('DELETE FROM quiz_scores WHERE user_id = ?')->execute([(int) $user['id']]);
ok(null, 'Votre progression a été réinitialisée.');
