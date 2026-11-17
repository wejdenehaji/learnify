<?php
// POST (admin) { courseId (slug), title, duration, video, content, tip, codeSnippet } : ajoute une leçon à la fin du cours.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$in = read_json();
$slug = input_string($in, 'courseId');
[$v, $errors] = validate_lesson_input($in);
if ($slug === '') {
    $errors['courseId'] = 'Cours manquant.';
}
if ($errors) {
    fail(reset($errors), 422, $errors);
}

$pdo = db();
$st = $pdo->prepare('SELECT id FROM courses WHERE slug = ?');
$st->execute([$slug]);
$courseId = $st->fetchColumn();
if (!$courseId) {
    fail('Cours introuvable.', 404);
}

$st = $pdo->prepare('SELECT COALESCE(MAX(lesson_order), -1) + 1 FROM lessons WHERE course_id = ?');
$st->execute([(int) $courseId]);
insert_lesson($pdo, (int) $courseId, $v, (int) $st->fetchColumn());

ok(fetch_course_full($pdo, $slug), 'Leçon ajoutée.', 201);
