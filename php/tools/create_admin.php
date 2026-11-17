<?php
/**
 * Création d'un administrateur en ligne de commande (impossible depuis le navigateur) :
 *   php php/tools/create_admin.php "Nom Prénom" admin@exemple.com MotDePasse123
 * Si l'e-mail existe déjà, ce compte devient administrateur (son mot de passe n'est pas modifié).
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Réservé à la ligne de commande.');
}
require __DIR__ . '/../config/database.php';

if ($argc < 4) {
    fwrite(STDERR, "Usage : php create_admin.php \"Nom\" email motdepasse\n");
    exit(1);
}
[, $name, $email, $password] = $argv;
$email = strtolower(trim($email));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || strlen($password) > 72 || trim($name) === '') {
    fwrite(STDERR, "Nom, e-mail valide et mot de passe de 8 à 72 caractères requis.\n");
    exit(1);
}

$pdo = db();
$st = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$st->execute([$email]);
if ($st->fetch()) {
    $pdo->prepare("UPDATE users SET role = 'admin' WHERE email = ?")->execute([$email]);
    echo "Le compte $email existe déjà : il est maintenant administrateur.\n";
} else {
    $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')")
        ->execute([trim($name), $email, password_hash($password, PASSWORD_DEFAULT)]);
    echo "Administrateur $email créé.\n";
}
