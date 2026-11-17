<?php
/**
 * Learnify - Connexion MySQL (PDO)
 * Modifiez uniquement les 5 constantes ci-dessous si votre configuration est différente.
 * (XAMPP par défaut : utilisateur "root", mot de passe vide.)
 */

const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NAME = 'learnify';
const DB_USER = 'root';
const DB_PASS = '';

/** Retourne l'unique connexion PDO de la requête (créée au premier appel). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // erreurs SQL -> exceptions
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,                    // vraies requêtes préparées
        ]);
    } catch (PDOException $e) {
        error_log('[Learnify] Connexion MySQL impossible : ' . $e->getMessage());
        if (function_exists('fail')) {
            fail('Base de données indisponible. Vérifiez que MySQL est démarré et que php/config/database.php est correct.', 503);
        }
        throw $e;
    }
    return $pdo;
}
