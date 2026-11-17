<?php
// POST (connecté) { courseId (slug), lessonIndex } : enregistre la dernière leçon consultée (bannière « Reprendre »).
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
$user = require_login();

$in = read_json();
$slug = input_string($in, 'courseId');
$index = input_int($in, 'lessonIndex');
if ($slug === '' || $index === null) {
    fail('Paramètres invalides.', 422);
}

$pdo = db();
$lesson = find_lesson($pdo, $slug, $index);
if ($lesson === null) {
    fail('Leçon introuvable.', 404);
}

// Crée la ligne (non terminée) si elle n'existe pas ; sinon met seulement à jour la date de dernier accès
$st = $pdo->prepare('INSERT INTO progress (user_id, course_id, lesson_id, completed, last_accessed) VALUES (?, ?, ?, 0, NOW())
                     ON DUPLICATE KEY UPDATE last_accessed = NOW()');
$st->execute([(int) $user['id'], $lesson['course_id'], $lesson['lesson_id']]);

ok(['courseId' => $slug, 'lessonId' => $index], 'Position enregistrée.');
