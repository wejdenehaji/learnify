<?php
// POST (connecté) { courseId (slug), lessonIndex, score, total } : enregistre le MEILLEUR score d'un quiz.
require_once __DIR__ . '/../middleware/bootstrap.php';
require_once __DIR__ . '/../lib/courses.php';
require_method('POST');
$user = require_login();

$in = read_json();
$slug = input_string($in, 'courseId');
$index = input_int($in, 'lessonIndex');
$score = input_int($in, 'score');
$total = input_int($in, 'total');
if ($slug === '' || $index === null || $score === null || $total === null || $total < 1 || $score < 0 || $score > $total) {
    fail('Paramètres invalides.', 422);
}

$pdo = db();
$lesson = find_lesson($pdo, $slug, $index);
if ($lesson === null) {
    fail('Leçon introuvable.', 404);
}
$st = $pdo->prepare('SELECT COUNT(*) FROM quiz_questions WHERE lesson_id = ?');
$st->execute([$lesson['lesson_id']]);
if ((int) $st->fetchColumn() !== $total) {
    fail('Le total ne correspond pas au nombre de questions du quiz.', 422);
}

$st = $pdo->prepare('INSERT INTO quiz_scores (user_id, lesson_id, score, total) VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE score = IF(VALUES(score) >= score, VALUES(score), score), total = VALUES(total)');
$st->execute([(int) $user['id'], $lesson['lesson_id'], $score, $total]);

$st = $pdo->prepare('SELECT score, total FROM quiz_scores WHERE user_id = ? AND lesson_id = ?');
$st->execute([(int) $user['id'], $lesson['lesson_id']]);
$best = $st->fetch();
ok(['score' => (int) $best['score'], 'total' => (int) $best['total']], 'Score enregistré.');
