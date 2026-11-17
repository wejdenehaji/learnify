<?php
// GET : utilisateur connecté (ou null) + jeton CSRF à renvoyer dans l'en-tête X-CSRF-Token des requêtes POST.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_method('GET');

$user = current_user();
ok(['user' => $user ? public_user($user) : null, 'csrfToken' => $_SESSION['csrf']]);
