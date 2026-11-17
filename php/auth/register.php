<?php
// POST { name, email, password } : crée un compte ÉTUDIANT et ouvre la session.
// Le rôle n'est jamais lu dans la requête : tout nouveau compte est "student".
require_once __DIR__ . '/../middleware/bootstrap.php';
require_method('POST');

$in = read_json();
$name = input_string($in, 'name');
$email = strtolower(input_string($in, 'email'));
$password = is_string($in['password'] ?? null) ? $in['password'] : '';

$errors = [];
if (text_len($name) < 2 || text_len($name) > 100) {
    $errors['name'] = 'Le nom doit contenir entre 2 et 100 caractères.';
}
if ($email === '' || strlen($email) > 190 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Adresse e-mail invalide.';
}
if (strlen($password) < 8 || strlen($password) > 72) {
    $errors['password'] = 'Le mot de passe doit contenir entre 8 et 72 caractères.';
}
if ($errors) {
    fail(reset($errors), 422, $errors);
}

$pdo = db();
$st = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$st->execute([$email]);
if ($st->fetch()) {
    fail('Cette adresse e-mail est déjà utilisée.', 409, ['email' => 'Cette adresse e-mail est déjà utilisée.']);
}

try {
    $st = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')");
    $st->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {   // doublon créé entre le SELECT et l'INSERT (index UNIQUE)
        fail('Cette adresse e-mail est déjà utilisée.', 409, ['email' => 'Cette adresse e-mail est déjà utilisée.']);
    }
    throw $e;
}
$id = (int) $pdo->lastInsertId();
$csrf = log_user_in($id);

ok(['user' => ['id' => $id, 'name' => $name, 'email' => $email, 'role' => 'student'], 'csrfToken' => $csrf], 'Compte créé avec succès.', 201);
