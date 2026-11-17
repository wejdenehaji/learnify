<?php
// GET ?id=<slug> : un cours complet avec leçons, chapitres et quiz (public).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('GET');

$slug = isset($_GET['id']) && is_string($_GET['id']) ? trim($_GET['id']) : '';
if ($slug === '') {
    fail('Identifiant de cours manquant.', 422);
}
$course = fetch_course_full(db(), $slug);
if ($course === null) {
    fail('Cours introuvable.', 404);
}
ok($course);
