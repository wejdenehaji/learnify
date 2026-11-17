<?php
/**
 * Learnify - Socle commun de tous les endpoints PHP
 *  - réponses JSON uniformes : { "success": bool, "message": string, "data": ... }
 *  - session sécurisée + jeton CSRF
 *  - contrôle d'accès : require_login() / require_admin()
 * Chaque endpoint commence par : require_once __DIR__ . '/../middleware/bootstrap.php';
 */

require_once __DIR__ . '/../config/database.php';

ini_set('display_errors', '0');          // ne jamais afficher d'erreur PHP au visiteur
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Toute exception non prévue : log serveur + réponse JSON générique (aucun détail technique envoyé au navigateur)
set_exception_handler(function (Throwable $e): void {
    error_log('[Learnify] ' . $e->getMessage() . ' (' . $e->getFile() . ':' . $e->getLine() . ')');
    if (!headers_sent()) {
        http_response_code(500);
    }
    echo json_encode(['success' => false, 'message' => 'Erreur interne du serveur.', 'data' => null, 'errors' => new stdClass()], JSON_UNESCAPED_UNICODE);
});

/* ---------- Réponses JSON ---------- */

function ok($data = null, string $message = 'OK', int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['success' => true, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** $errors = erreurs par champ, ex. ['email' => 'Adresse invalide.'] */
function fail(string $message, int $status = 400, array $errors = []): void
{
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message, 'data' => null, 'errors' => (object) $errors], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ---------- Session ---------- */

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    ini_set('session.use_strict_mode', '1');    // refuse les identifiants de session inventés par le client
    ini_set('session.use_only_cookies', '1');
    session_name('LEARNIFYSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,                      // cookie illisible par JavaScript
        'secure'   => $secure,                   // HTTPS uniquement si le site est en HTTPS
        'samesite' => 'Lax',
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

/* ---------- Requête ---------- */

/** Vérifie la méthode HTTP ; pour tout ce qui modifie des données, vérifie aussi le jeton CSRF. */
function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        fail('Méthode non autorisée.', 405);
    }
    if ($method !== 'GET') {
        verify_csrf();
    }
}

function verify_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $real = $_SESSION['csrf'] ?? '';
    if (!is_string($sent) || $sent === '' || !hash_equals($real, $sent)) {
        fail('Jeton de sécurité invalide ou session expirée. Rechargez la page.', 403);
    }
}

/** Lit le corps JSON de la requête (tableau associatif). */
function read_json(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 1048577);
    if ($raw === false || $raw === '') {
        return [];
    }
    if (strlen($raw) > 1048576) {
        fail('Requête trop volumineuse.', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Corps de requête JSON invalide.', 400);
    }
    return $data;
}

/* ---------- Utilisateur connecté ---------- */

function public_user(array $u): array
{
    return ['id' => (int) $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role']];
}

/** L'utilisateur est relu en base à chaque requête : le rôle ne vient jamais du navigateur. */
function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $st = db()->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $st->execute([(int) $_SESSION['user_id']]);
    $user = $st->fetch();
    return $user ?: null;
}

function require_login(): array
{
    $user = current_user();
    if ($user === null) {
        fail('Connexion requise.', 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if ($user['role'] !== 'admin') {
        fail('Accès réservé aux administrateurs.', 403);
    }
    return $user;
}

/** Après connexion : nouvel identifiant de session (anti « session fixation ») + nouveau jeton CSRF. */
function log_user_in(int $userId): string
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

/* ---------- Petits utilitaires de validation ---------- */

function text_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Valeur texte nettoyée (trim) ; chaîne vide si absente ou si ce n'est pas du texte. */
function input_string(array $in, string $key): string
{
    $v = $in[$key] ?? '';
    return is_string($v) ? trim($v) : '';
}

function input_int(array $in, string $key): ?int
{
    $v = $in[$key] ?? null;
    return is_int($v) ? $v : null;
}

start_session();
