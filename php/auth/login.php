<?php
// POST { email, password } : ouvre la session si les identifiants sont corrects.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_method('POST');

$in = read_json();
$email = strtolower(input_string($in, 'email'));
$password = is_string($in['password'] ?? null) ? $in['password'] : '';

if ($email === '' || $password === '') {
    fail('Veuillez saisir votre e-mail et votre mot de passe.', 422);
}

$pdo = db();
$st = $pdo->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
$st->execute([$email]);
$user = $st->fetch();

// Même travail de hachage que l'utilisateur existe ou non, et même message d'erreur dans les deux cas
$hash = $user ? $user['password'] : password_hash('mot-de-passe-factice', PASSWORD_DEFAULT);
$valid = password_verify($password, $hash);
if (!$user || !$valid) {
    fail('E-mail ou mot de passe incorrect.', 401);
}

if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
    $up = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $up->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
}

$csrf = log_user_in((int) $user['id']);
ok(['user' => public_user($user), 'csrfToken' => $csrf], 'Connexion réussie.');
