<?php
// POST (connecté) { courseId (slug), lessonIndex, completed } : marque une leçon terminée / non terminée.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
$user = require_login();

$in = read_json();
$slug = input_string($in, 'courseId');
$index = input_int($in, 'lessonIndex');
if ($slug === '' || $index === null || !array_key_exists('completed', $in) || !is_bool($in['completed'])) {
    fail('Paramètres invalides.', 422);
}

$pdo = db();
$lesson = find_lesson($pdo, $slug, $index);
if ($lesson === null) {
    fail('Leçon introuvable.', 404);
}

// user_id = celui de la session, jamais une valeur envoyée par le navigateur
$st = $pdo->prepare('INSERT INTO progress (user_id, course_id, lesson_id, completed, last_accessed) VALUES (?, ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE completed = VALUES(completed), last_accessed = NOW()');
$st->execute([(int) $user['id'], $lesson['course_id'], $lesson['lesson_id'], $in['completed'] ? 1 : 0]);

ok(['completed' => $in['completed'], 'stats' => course_stats($pdo, (int) $user['id'], $lesson['course_id'])], 'Progression enregistrée.');
