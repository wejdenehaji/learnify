<?php
// POST (admin) { lessonId } : supprime une leçon puis renumérote les suivantes (0, 1, 2…).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
require_admin();

$lessonId = input_int(read_json(), 'lessonId');
if ($lessonId === null) {
    fail('Leçon manquante.', 422);
}

$pdo = db();
$st = $pdo->prepare('SELECT l.course_id, l.lesson_order, c.slug FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?');
$st->execute([$lessonId]);
$lesson = $st->fetch();
if (!$lesson) {
    fail('Leçon introuvable.', 404);
}

$pdo->beginTransaction();
try {
    $pdo->prepare('DELETE FROM lessons WHERE id = ?')->execute([$lessonId]);
    // Les numéros restent contigus ; ORDER BY évite un conflit avec l'index UNIQUE (course_id, lesson_order)
    $pdo->prepare('UPDATE lessons SET lesson_order = lesson_order - 1 WHERE course_id = ? AND lesson_order > ? ORDER BY lesson_order ASC')
        ->execute([(int) $lesson['course_id'], (int) $lesson['lesson_order']]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

ok(fetch_course_full($pdo, $lesson['slug']), 'Leçon supprimée.');
