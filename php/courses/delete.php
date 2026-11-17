<?php
// POST (admin) { id (slug) } : supprime un cours (leçons, quiz et progression associés partent en cascade).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$slug = input_string(read_json(), 'id');
if ($slug === '') {
    fail('Identifiant de cours manquant.', 422);
}
$st = db()->prepare('DELETE FROM courses WHERE slug = ?');
$st->execute([$slug]);
if ($st->rowCount() === 0) {
    fail('Cours introuvable.', 404);
}
ok(null, 'Cours supprimé.');
